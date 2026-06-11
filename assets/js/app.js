// SupaBase Integration ------------------------
const supabaseUrl = "https://ytyuthjlgjwlorblfyim.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0eXV0aGpsZ2p3bG9yYmxmeWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjQzNDEsImV4cCI6MjA5NjE0MDM0MX0.8nyTL-N8ygfH88X1uCtyiTF66ykx0MGHaDMpFiWsKAI";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements ---------------------------------
const list = document.querySelector(".list");
const input = document.querySelector(".input");
const form = document.getElementById("todoForm"); // Form reference for submission

let isActive = true; // For controlling edit state

// Helper Function: UI me Todo Item Render karne ke liye
// Is se Create aur Load dono waqt SAME UI banega aur buttons chalenge.
function createTodoUI(id, text, isCompleted, index) {
    const li = document.createElement("li");
    li.setAttribute("class", "item");
    li.dataset.id = id; // Supabase ki ID ko HTML element me save kar rahe hain
    if (isCompleted) li.classList.add("completed");

    // 1. Checkbox
    const checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");
    checkBox.setAttribute("class", "checkbox");
    checkBox.checked = isCompleted;
    li.appendChild(checkBox);

    // 2. Text Wrapper Span
    const todoTextSpan = document.createElement("span");
    todoTextSpan.setAttribute("class", "todo-text");

    const serialNumber = document.createElement("span");
    serialNumber.setAttribute("class", "serial-number");
    serialNumber.textContent = `${index}. `;
    todoTextSpan.appendChild(serialNumber);

    const contentSpan = document.createElement("span");
    contentSpan.setAttribute("class", "content");
    contentSpan.textContent = text;
    todoTextSpan.appendChild(contentSpan);

    li.appendChild(todoTextSpan);

    // 3. Update Button
    const updateButton = document.createElement("button");
    updateButton.setAttribute("type", "button");
    updateButton.setAttribute("class", "updateBtn");
    updateButton.innerHTML = `<i class="fa-solid fa-pencil"></i>`;
    li.appendChild(updateButton);

    // 4. Delete Button
    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("type", "button");
    deleteButton.setAttribute("class", "deleteBtn");
    deleteButton.innerHTML = `<i class="fa-solid fa-x"></i>`;
    li.appendChild(deleteButton);

    list.appendChild(li);
}

// 1. CREATE: Form submit hone par Naya Todo database aur UI me add hoga
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    let inputText = input.value.trim();
    if (!inputText) return;

    // UI me foran add karne ke liye temporary index
    const nextIndex = list.children.length + 1;

    // Supabase me insert karo aur returned data (ID) lelo
    const { data, error } = await supabaseClient
        .from("todos")
        .insert([{ title: inputText, is_completed: false }])
        .select();

    if (error) {
        console.error("Error inserting todo:", error);
        return;
    }

    if (data && data.length > 0) {
        // Database me save hone ke baad real ID ke sath UI me dikhao
        createTodoUI(data[0].id, data[0].title, data[0].is_completed, nextIndex);
    }

    input.value = ""; // Input clear
});

// Global Click Events (Search, Update, Delete, Checkbox)
document.addEventListener("click", async function (event) {
    const target = event.target;

    // 2. READ / SEARCH (Approximate Case-Insensitive Match)
    if (target.id == "readBtn" || target.closest("#readBtn")) {
        let searchText = input.value.toLowerCase().trim();
        console.log("Searching for:", searchText);

        const items = list.querySelectorAll(".item");
        items.forEach((item) => {
            const content = item.querySelector(".content").textContent.toLowerCase();
            
            // `.includes()` lagaya hai taake partial/approximate match ho jaye
            if (content.includes(searchText)) {
                item.classList.remove("notVisible");
            } else {
                item.classList.add("notVisible");
            }
        });

        // 1.5 seconds baad list ko normal kar do
        setTimeout(() => {
            items.forEach(item => item.classList.remove("notVisible"));
        }, 1500);
        return;
    }

    // 3. UPDATE / EDIT (Inline Rename + Database Sync)
    if ((target.classList.contains("updateBtn") || target.closest(".updateBtn")) && isActive) {
        const li = target.closest(".item");
        const todoId = li.dataset.id;
        const contentSpan = li.querySelector(".content");
        const oldText = contentSpan.textContent;

        isActive = false; // Mazeed edits lock karo jab tak ye save nahi hota

        // Edit Input Box Create karo
        const inputForEdit = document.createElement("input");
        inputForEdit.setAttribute("type", "text");
        inputForEdit.setAttribute("class", "inputForEdit");
        inputForEdit.value = oldText;

        contentSpan.style.display = "none";
        contentSpan.parentElement.appendChild(inputForEdit);
        inputForEdit.focus();

        async function saveEdit() {
            const newValue = inputForEdit.value.trim();

            if (newValue !== "" && newValue !== oldText) {
                contentSpan.textContent = newValue;

                // Supabase Sync
                const { error } = await supabaseClient
                    .from("todos")
                    .update({ title: newValue })
                    .eq("id", todoId);

                if (error) console.error("Error updating todo:", error);
            }

            contentSpan.style.display = "inline";
            inputForEdit.remove();
            isActive = true; // Edit lock unlock karo
        }

        // Blur ya Enter dabane par save ho jaye
        inputForEdit.addEventListener("blur", saveEdit);
        inputForEdit.addEventListener("keypress", function (e) {
            if (e.key === "Enter") saveEdit();
        });
        return;
    }

    // 4. DELETE (UI + Database Sync)
    if (target.classList.contains("deleteBtn") || target.closest(".deleteBtn")) {
        const li = target.closest(".item");
        const todoId = li.dataset.id;

        // UI se remove karo
        li.remove();
        recalculateSerials(); // Serial numbers reset karne ke liye

        // Supabase se delete karo
        const { error } = await supabaseClient
            .from("todos")
            .delete()
            .eq("id", todoId);

        if (error) console.error("Error deleting todo:", error);
        return;
    }

    // 5. CHECKBOX TOGGLE (Status Style + Database Sync)
    if (target.classList.contains("checkbox")) {
        const li = target.closest(".item");
        const todoId = li.dataset.id;
        const isChecked = target.checked;

        if (isChecked) {
            li.classList.add("completed");
        } else {
            li.classList.remove("completed");
        }

        // Supabase me status update karo
        const { error } = await supabaseClient
            .from("todos")
            .update({ is_completed: isChecked })
            .eq("id", todoId);

        if (error) console.error("Error updating status:", error);
    }
});

// Helper Function: Delete hone ke baad serial numbers (1, 2, 3...) sahi karne ke liye
function recalculateSerials() {
    const serials = list.querySelectorAll(".serial-number");
    serials.forEach((serial, index) => {
        serial.textContent = `${index + 1}. `;
    });
}

// LOAD: Page load hote hi database se saare todos lekar UI banana
async function loadTodos() {
    list.innerHTML = ""; // Pehle list saaf karo
    
    const { data, error } = await supabaseClient
        .from("todos")
        .select("*")
        .order("id", { ascending: true }); // Taake tarteeb sahi rahe

    if (error) {
        console.error("Error loading todos:", error);
        return;
    }

    if (data) {
        data.forEach((todo, index) => {
            // Har todo ko mukammal structure ke sath render karo
            createTodoUI(todo.id, todo.title, todo.is_completed, index + 1);
        });
    }
}

// App Shuru hote hi data load karo
loadTodos();