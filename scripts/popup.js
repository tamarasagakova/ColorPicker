// Reference: https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper

window.addEventListener('DOMContentLoaded', () => {
    const mainDiv = document.getElementById("main-div");
    const buttonDiv = document.getElementById("main-button-div");
    const colorList = document.getElementById("color-code");

    const GiveMetheChild = (color, msg) => {
        const errorLabel = document.createElement("p")
        errorLabel.setAttribute("class", "errorLabel")
        errorLabel.style.backgroundColor = color
        errorLabel.innerText = msg

        mainDiv.appendChild(errorLabel)
        setTimeout(() => {
            mainDiv.removeChild(errorLabel)
        }, 2000)
    }

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
            button.innerText = "Use magnifier to find desired color code!"

            button.addEventListener("click", () => {
                if (!window.EyeDropper) {
                    GiveMetheChild("#ad5049", 'Your browser does not support the ClolorPicker API')
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
                    GiveMetheChild("#e19526", "Hex code is copied to clipboard!")
                })
                colorList.appendChild(liElem)
            })

            const clearButton = document.createElement("button")
            clearButton.innerText = "Clear Memory" 
            clearButton.setAttribute("id", "clearButton")
            clearButton.addEventListener("click", () => {
                chrome.storage.local.remove("color_hex_code")
                window.close()
            })
            mainDiv.appendChild(clearButton)
        }

    })

})
