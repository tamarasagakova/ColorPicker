// Reference: https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper

window.addEventListener('DOMContentLoaded', () => {
    const mainDiv = document.getElementById("main-div");
    const trashDiv = document.getElementById("trash-div");
    const buttonDiv = document.getElementById("main-button-div");
    const colorList = document.getElementById("color-code");
    const darkModeIcon = document.getElementById("dark-mode-icon");
    const title = document.querySelector("#main-div>h1");
    let messageDisplayed = false;

    let isDarkMode = false; // Variable to track the dark mode state

    const toggleDarkMode = () => {
        const liElements = document.querySelectorAll("#color-code li");
        const msg = document.querySelector("li");
        if (isDarkMode) {
            // Switch to light mode
            document.body.style.background = "rgb(248, 248, 237)";
            mainDiv.style.color = "black";
            darkModeIcon.classList.remove("fa-moon");
            darkModeIcon.classList.add("fa-sun");
            title.style.webkitTextStroke = "1px black";
            msg.style.color = "black";

            liElements.forEach(li => {
                li.classList.remove("li-dark-mode");
                li.classList.add("li-light-mode");
            });

        } else {
            // Switch to dark mode
            document.body.style.background = "#222222";
            mainDiv.style.color = "white";
            darkModeIcon.classList.remove("fa-sun");
            darkModeIcon.classList.add("fa-moon");
            title.style.webkitTextStroke = "0.6px white";
            msg.style.color = "white";

            liElements.forEach(li => {
                li.classList.remove("li-light-mode");
                li.classList.add("li-dark-mode");
            });
        }
        isDarkMode = !isDarkMode; // Toggle the dark mode state
    };

    // Add click event listener to the dark mode icon
    darkModeIcon.addEventListener("click", toggleDarkMode);


    const produceChild = (msg) => {
        if (messageDisplayed) {
            return;
        }
        const errorLabel = document.createElement("p");
        errorLabel.setAttribute("class", "errorLabel");
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
                    produceChild("Your browser does not support the ClolorPicker API");
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
                liElem.classList.add("li-light-mode");

                
                liElem.addEventListener("click", () => {
                    navigator.clipboard.writeText(hexCode);
                    produceChild("Hex code has been copied");
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
            clearIcon.style.fontSize = "20px";
            clearIcon.style.cursor = "pointer";

            trashDiv.appendChild(clearIcon);
            trashDiv.style.display = "flex";
            trashDiv.style.gap = "10px";
            trashDiv.style.justifyContent = "center";
        
            clearIcon.addEventListener("click", () => {
                chrome.storage.local.remove("color_hex_code");
                window.close();
            });



        }

    })

})
