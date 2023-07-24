// Reference: https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper

window.addEventListener('DOMContentLoaded', () => {
    const mainDiv = document.getElementById("main-div");
    const trashDiv = document.getElementById("trash-div");
    const buttonDiv = document.getElementById("main-button-div");
    const colorList = document.getElementById("color-code");
    let messageDisplayed = false;

    const produceChild = (msg, textColor, backgroundColor, margin, borderColor) => {
        if (messageDisplayed) {
            return;
        }

        const errorLabel = document.createElement("p");
        errorLabel.setAttribute("class", "errorLabel");
        errorLabel.style.color = textColor || "#0b0610";
        errorLabel.style.backgroundColor = backgroundColor || "ffffff";
        errorLabel.style.padding = "8px";
        errorLabel.style.borderRadius = "7px";
        errorLabel.style.margin = margin || "0";
        errorLabel.style.border = borderColor ? `2px solid ${borderColor}` : "2px solid transparent";
        errorLabel.innerText = msg;

        mainDiv.appendChild(errorLabel);
        messageDisplayed = true;
        setTimeout(() => {
            mainDiv.removeChild(errorLabel);
            messageDisplayed = false;
        }, 2000);
    };

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0]

        if (tab.url === undefined || tab.url.indexOf('chrome') == 0) {
            buttonDiv.innerHTML = 'Color Picker cannot access Chrome pages.'
        }
        else if (tab.url.indexOf('file') === 0) {
            buttonDiv.innerHTML = 'Color Picker cannot access local pages.'

        } else {
            const button = document.createElement("button")
            button.setAttribute("id", "main_button")
            button.innerText = "Click to use magnifier to find desired color code!"

            button.addEventListener("click", () => {
                if (!window.EyeDropper) {
                    produceChild("Your browser does not support the ClolorPicker API", "#161b1d", "#ffffff", "10px 0", "#161b1d");
                    return
                }

                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { from: "popup", query: "eye_dropper_clicked" }
                );
                window.close()
            })

            buttonDiv.appendChild(button)
        }
    });




    chrome.storage.local.get("color_hex_code", (resp) => {

        if (resp.color_hex_code && resp.color_hex_code.length > 0) {
            resp.color_hex_code.forEach(hexCode => {
                const liElem = document.createElement("li")
                liElem.innerText = hexCode
                liElem.style.backgroundColor = hexCode
                liElem.addEventListener("click", () => {
                    navigator.clipboard.writeText(hexCode);
                    produceChild("Hex code has been copied", "#161b1d", "#ffffff", "10px 0", "#161b1d");
                })
                colorList.appendChild(liElem)
            })

            const clearIcon = document.createElement("i");
            clearIcon.classList.add("fa-regular", "fa-trash-can");
            clearIcon.style.color = "#000000";
            clearIcon.style.fontSize = "20px";
            clearIcon.style.cursor = "pointer";

            trashDiv.appendChild(clearIcon);
            trashDiv.style.display = "flex";
            trashDiv.style.justifyContent = "center";

            clearIcon.addEventListener("click", () => {
                chrome.storage.local.remove("color_hex_code");
                window.close();
            });

        }

    })

})
