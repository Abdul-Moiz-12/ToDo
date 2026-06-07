const list = document.querySelector(".list");
const input = document.querySelector(".input");

let count = 1;
let isActive = true;

document.addEventListener("click", function (event) {

    // Create: Done!
    if (event.target.id == "createBtn" || event.target.classList.contains("fa-plus")) {

        count++;
        let inputText = input.value;

        console.log("create wala button click hua hay");

        //  li creation inside list
        const li = document.createElement("li");
        li.setAttribute("class", "item");
        list.appendChild(li);

        // checkbox creation in li
        const checkBox = document.createElement("input");
        checkBox.setAttribute("type", "checkbox");
        checkBox.setAttribute("class", "checkbox")
        li.appendChild(checkBox);

        // span creation in li
        const span = document.createElement("span");
        li.appendChild(span);

        // serial number creation in span
        const serialNumber = document.createElement("span");
        serialNumber.setAttribute("class", "serial-number");
        span.prepend(serialNumber);
        serialNumber.textContent = `${count}.`;

        const contentSpan = document.createElement("span");
        contentSpan.setAttribute("class", "content");
        span.appendChild(contentSpan);
        contentSpan.textContent = `${inputText}`

        // update button creation in li
        // 1. button creation
        const updateButton = document.createElement("button"); // create hogya
        updateButton.setAttribute("class", "updateBtn"); // class set hogayi
        li.appendChild(updateButton); // li me update button ko shamil kardia

        // 2. icon creation
        const updateIcon = document.createElement("i");
        updateIcon.setAttribute("class", "fa-solid fa-pencil");
        updateButton.appendChild(updateIcon);



        // delete button creation in li
        // 1. button creation
        const deleteButton = document.createElement("button");
        deleteButton.setAttribute("class", "deleteBtn");
        li.appendChild(deleteButton);

        // 2. icon creation
        const deleteIcon = document.createElement("i");
        deleteIcon.setAttribute("class", "fa-solid fa-x");
        deleteButton.appendChild(deleteIcon)

        // input value clearation
        input.value = "";
    }
    // ---------------------------------------------------

    // Read / Search : Done! but isko approximate match banana hay!

    if (event.target.id == "readBtn" || event.target.classList.contains("fa-magnifying-glass")) {

        let inputText = input.value;

        console.log("read button click hua hay");
        console.log(inputText);

        for (let i = 0; i < list.children.length; i++) {

            list.children[i].classList.add("notVisible");
            if (inputText == list.children[i].children[1].children[1].textContent) {
                list.children[i].classList.remove("notVisible");
            }

            setTimeout(() => { list.children[i].classList.remove("notVisible") }, 1400)
        }
    }
    // ---------------------------------------------------
    // Update / Rename: 

    if (event.target.classList.contains("updateBtn") && isActive) {

        console.log(" *update button click hua hay*");
        isActive = false;
        const targetedNode = event.target.parentElement.children[1].children[1];
        const content = targetedNode.textContent;

        // new Element creation in Targeted Node:
        const inputForEdit = document.createElement("input");
        inputForEdit.setAttribute("type", "text");
        inputForEdit.setAttribute("class", "inputForEdit");

        inputForEdit.value = content;

        targetedNode.parentElement.appendChild(inputForEdit);
        // ---------------------------------

        function saveEdit() {
            const newValue = inputForEdit.value.trim();

            if (newValue !== "") {
                targetedNode.textContent = newValue;
            }

            targetedNode.style.display = "flex";
            inputForEdit.remove();
            isActive = !isActive;
        }

        inputForEdit.addEventListener("blur", saveEdit);
        inputForEdit.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                saveEdit();
            }
        });




        targetedNode.style.display = "none";
    }

    // ---------------------------------------------------

    // Delete: Done!
    if (event.target.classList.contains("deleteBtn")) {
        console.log("Delete button click hua hay");
        event.target.parentElement.remove();

    } else if (event.target.classList.contains("fa-x")) {
        event.target.parentElement.parentElement.remove();
    }
    // ---------------------------------------------------

    // checkbox: Done!
    if (event.target.classList.contains("checkbox")) {
        console.log("checkbox click hua hay");
        if (event.target.checked) {
            event.target.nextElementSibling.style.textDecoration = "line-through";
            event.target.nextElementSibling.style.color = `rgb(0, 0, 0, 0.5)`;
        } else {
            event.target.nextElementSibling.style.textDecoration = "none";
            event.target.nextElementSibling.style.color = "black";
        }
    }
})


