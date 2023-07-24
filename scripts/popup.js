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
                const liElem = document.createElement("li");
                liElem.style.backgroundColor = hexCode;
                liElem.addEventListener("click", () => {
                    navigator.clipboard.writeText(hexCode);
                    produceChild("Hex code has been copied", "#161b1d", "#ffffff", "10px 0", "#161b1d");
                });

                liElem.style.height = "20px";

                liElem.addEventListener("mouseover", () => {
                    liElem.innerText = hexCode;
                });

                liElem.addEventListener("mouseout", () => {
                    liElem.innerText = "";
                });

                colorList.appendChild(liElem);
            });

            const clearIcon = document.createElement("i");
            clearIcon.classList.add("fa-regular", "fa-trash-can");
            clearIcon.style.color = "#000000";
            clearIcon.style.fontSize = "20px";
            clearIcon.style.cursor = "pointer";

            trashDiv.appendChild(clearIcon);
            trashDiv.style.display = "flex";
            trashDiv.style.gap = "10px";
            trashDiv.style.justifyContent = "center";
            
            /*const moonIcon = document.createElement("i");
            moonIcon.classList.add("fa-regular", "fa-moon");
            moonIcon.style.color = "#000000";
            moonIcon.style.fontSize = "20px";
            moonIcon.style.cursor = "pointer";
            
            const sunIcon = document.createElement("i");
            sunIcon.classList.add("fa-regular", "fa-sun");
            sunIcon.style.color = "#000000";
            sunIcon.style.fontSize = "20px";
            sunIcon.style.cursor = "pointer";
            
            let isMoonIconShown = true; // Variable to track the icon state
            
            const toggleIcon = () => {
                if (isMoonIconShown) {
                    // Remove the moon icon and show the sun icon
                    trashDiv.removeChild(moonIcon);
                    trashDiv.appendChild(sunIcon);
                } else {
                    // Remove the sun icon and show the moon icon
                    trashDiv.removeChild(sunIcon);
                    trashDiv.appendChild(moonIcon);
                }
                isMoonIconShown = !isMoonIconShown; // Toggle the icon state
            };
        
            // Add click event listener to the moonIcon
            moonIcon.addEventListener("click", toggleIcon);
            sunIcon.addEventListener("click", toggleIcon);*/
        
            clearIcon.addEventListener("click", () => {
                chrome.storage.local.remove("color_hex_code");
                window.close();
            });



        }

    })

})
