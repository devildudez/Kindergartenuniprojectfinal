const GROUPS = {"1": "Acorns", "2": "Sunflowers"}

const START_CHILDREN = [
    { id : 1, fullName: "Amelia Green", birthdate: "2021-03-12", groupId: "1", status: "Enrolled", guardianName: "Laura Green", guardianEmail: "laura.green@example.com" },
    { id : 2, fullName: "Noah Miller", birthdate: "2021-07-25", groupId: "1", status: "Enrolled", guardianName: "Sophie Miller", guardianEmail: "sophie.miller@example.com" },
    { id : 3, fullName: "Olivia Lee", birthdate: "2022-01-09", groupId: "2", status: "Waitlisted", guardianName: "Emma Lee", guardianEmail: "emma.lee@example.com" }
];

const START_USERS = [
    {id:1, fullName: "Emma Reed", email: "emma.reed@example.com", password: "password123", role: "ADMIN"},
    {id:2, fullName: "James Holt", email: "james.holt@example.com", password: "password456", role: "EDUCATOR"},
    {id:3, fullName: "Sophie Knight", email: "sophie.knight@example.com", password: "password789", role: "EDUCATOR"}
]




function load(key, startValue){
    const saved = localStorage.getItem(key);
    if(saved == null){
        return startValue;
    }
    return JSON.parse(saved);
}


function save(key, value){
    localStorage.setItem(key, JSON.stringify(value));

}



function showMessage(title, text, color){
    const box = document.querySelector("#page-message");
    box.replaceChildren();
    const bold = document.createElement("b");
    bold.textContent = title;
    bold.style.display = "block";
    bold.style.marginBottom = "4px";
    const small = document.createElement("span");
    small.textContent = text;
    box.append(bold, small);
    if(color === "green"){
        box.style.backgroundColor = "#E4EDDA";
    }else{
        box.style.backgroundColor = "#F6E1DA";
    }
    box.style.display = "block";
}


function hideMessage(){
    document.querySelector("#page-message").style.display = "none";
}


function nextId(items){
    let max = 0;
    for(const item of items){
        if(item.id > max){
            max = item.id;
        }
    }
    return max + 1;
}


function formatDate(isoDate, month){
    const date = new Date(isoDate + "T00:00:00");
    return date.toLocaleDateString("en-GB", {day: "2-digit", month: month, year: "numeric"});

}

function today(){
    return new Date().toISOString().slice(0, 10);
}

function childFromUrl(){
    const id = Number(new URLSearchParams(location.search).get("id"));
    const children = load("children", START_CHILDREN);
    return children.find((child) => child.id === id);
}


function setupSignin(){
    const form = document.querySelector("#signin-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        const email = data.email.trim().toLowerCase();
        const users = load("users", START_USERS);
        const user = users.find((u) => u.email.toLowerCase() === email && u.password === data.password);
        if(!user){
            showMessage("Sign in failed", "Invalid email or password. Try again.");
            return;
        }
        save("currentUser", {id:user.id, fullName:user.fullName, role:user.role});
        location.href = "Registry.html";
    });
}



function setupRegister(){
    const form = document.querySelector("#register-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        if(data.password !== data.confirmPassword){
            showMessage("Passwords do not match", "Type the same password in both fields.");
            return;
        }
        const email = data.email.trim().toLowerCase();
        const users = load("users", START_USERS);
        const user = users.find((u) => u.email.toLowerCase() === email);
        if(user){
            showMessage("Account already exists", "This email is already registered. Sign in instead.");
            return;
        }
        users.push({id: nextId(users), fullName: data.fullName.trim(), email: email, password: data.password, role: "EDUCATOR"});
        save("users", users);
        location.href = "Signin.html";
    });
}


function setupRegistry(){
    const search = document.querySelector("#registry-search");
    const group = document.querySelector("#registry-group");
    const sort = document.querySelector("#registry-sort");
    const rows = document.querySelector("#registry-rows");
    const count = document.querySelector("#registry-count");
    function render(){
        const text = search.value.trim().toLowerCase();
        let children = load("children", START_CHILDREN);
        children = children.filter((child) => (child.fullName + " " + child.guardianName).toLowerCase().includes(text));
        if(group.value !== "all"){
            children = children.filter((child) => child.groupId === group.value);
        }
        if(sort.value === "name"){
            children.sort((a, b) => a.fullName.localeCompare(b.fullName));
        }else{
            children.sort((a, b) => a.birthdate.localeCompare(b.birthdate));
        }
        rows.replaceChildren();
        for(const child of children){
            const row = document.createElement("tr");
            row.style.height = "74px";
            row.style.borderBottom = "1px solid #E4EDDA";
            const values = [child.fullName, formatDate(child.birthdate, "short"), GROUPS[child.groupId], child.guardianName, child.status];
            for(const value of values){
                const cell = document.createElement("td");
                cell.textContent = value;
                cell.style.padding = "0 0 6px 0";
                cell.style.color = "#284D36";
                row.append(cell);
            }
            row.firstChild.style.paddingLeft = "18px";
            row.firstChild.style.fontWeight = "bold";
            row.children[4].style.color = "#5B7550";
            const actions = document.createElement("td");
            actions.style.paddingBottom = "6px";
            const view = document.createElement("button");
            view.type = "button";
            view.textContent = "View";
            view.style.cssText = "width:92px; height:42px; border:none; border-radius:6px; background-color:#284D36; color:white; font-family:inherit; font-size:15px; font-weight:bold; cursor:pointer;";
            view.addEventListener("click", () => {
                location.href = "Childdetail.com.html?id=" + child.id;
            });
            actions.append(view);
            row.append(actions);
            rows.append(row);
        }
        if(children.length === 0){
            count.textContent = "";
            showMessage("No results", "No children match. Clear the filters and try again.", "green");
        }else{
            count.textContent = "Showing " + children.length + " children";
            hideMessage();
        }
    }

    search.addEventListener("input", render);
    group.addEventListener("change", render);
    sort.addEventListener("change", render);
    render();
}


function setupChildForm(child){
    const form = document.querySelector("#child-form");
    form.birthdate.max = today();
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        if(data.birthdate > today()){
            showMessage("Invalid birth date", "Choose a birth date that is today or earlier.");
            return;
        }
        const children = load("children", START_CHILDREN);
        if(child){
            data.id = child.id;
            const index = children.findIndex((c) => c.id === child.id);
            children[index] = data;
        }else{
            data.id = nextId(children);
            children.push(data);
        }
        try{
            save("children", children);
        }catch(error){
            showMessage("Save failed", "Your entries are still here. Try saving again.");
            return;
        }
        location.href = "Childdetail.com.html?id=" + data.id;
    });
}


function setupAdd(){
    setupChildForm(null);
}


function setupEdit(){
    const child = childFromUrl();
    if(!child){
        showMessage("Child not found", "Go back to the registry and choose a child.");
        return;
    }
    document.querySelector("#edit-subtitle").textContent = "Update " + child.fullName + "'s record.";
    const form = document.querySelector("#child-form");
    for(const name in child){
        if(form.elements[name]){
            form.elements[name].value = child[name];
        }
    }
    document.querySelector("#cancel-child-form").addEventListener("click", () => {
        location.href = "Childdetail.com.html?id=" + child.id;
    });
    setupChildForm(child);
}


function setupDetails(){
    const child = childFromUrl();
    if(!child){
        showMessage("Child not found", "Go back to the registry and choose a child.");
        return;
    }
    document.querySelector("#child-heading").textContent = child.fullName;
    document.querySelector("#child-subtitle").textContent = "Child record · " + child.status;
    document.querySelector("#full-name").textContent = child.fullName;
    document.querySelector("#birth-date").textContent = formatDate(child.birthdate, "long");
    document.querySelector("#group-name").textContent = GROUPS[child.groupId];
    document.querySelector("#child-status").textContent = child.status;
    document.querySelector("#guardian-name").textContent = child.guardianName;
    document.querySelector("#guardian-email").textContent = child.guardianEmail;
    document.querySelector("#edit-child").addEventListener("click", () => {
        location.href = "Edit.html?id=" + child.id;
    });
    document.querySelector("#delete-child").addEventListener("click", () => {
        location.href = "deletechild.html?id=" + child.id;
    });
}


function setupDelete(){
    const child = childFromUrl();
    if(!child){
        showMessage("Child not found", "Go back to the registry and choose a child.");
        return;
    }
    document.querySelector("#delete-heading").textContent = "Delete " + child.fullName + "?";
    document.querySelector("#cancel-delete").addEventListener("click", () => {
        location.href = "Childdetail.com.html?id=" + child.id;
    });
    document.querySelector("#confirm-delete").addEventListener("click", () => {
        const children = load("children", START_CHILDREN).filter((c) => c.id !== child.id);
        save("children", children);
        location.href = "Registry.html";
    });
}


function setupStatistics(){
    const children = load("children", START_CHILDREN);
    const users = load("users", START_USERS);
    const enrolled = children.filter((child) => child.status === "Enrolled").length;
    document.querySelector("#count-users").textContent = users.length;
    document.querySelector("#count-enrolled").textContent = enrolled;
    document.querySelector("#count-waitlisted").textContent = children.length - enrolled;

    let max = 1;
    for(const groupId in GROUPS){
        const inGroup = children.filter((child) => child.groupId === groupId).length;
        if(inGroup > max){
            max = inGroup;
        }
    }
    for(const groupId in GROUPS){
        const inGroup = children.filter((child) => child.groupId === groupId).length;
        const name = GROUPS[groupId].toLowerCase();
        document.querySelector("#count-" + name).textContent = inGroup;
        document.querySelector("#bar-" + name).style.width = (inGroup / max) * 450 + "px";
    }
}


function setupRoles(){
    const users = load("users", START_USERS);
    const list = document.querySelector("#staff-rows");
    const template = document.querySelector("#staff-row");
    for(const user of users){
        const row = template.content.cloneNode(true);
        row.querySelector(".staff-name").textContent = user.fullName;
        const select = row.querySelector("select");
        select.value = user.role;
        row.querySelector("button").addEventListener("click", () => {
            user.role = select.value;
            save("users", users);
            let roleName = "Educator";
            if(user.role === "ADMIN"){
                roleName = "Administrator";
            }
            showMessage("Role saved", user.fullName + " is now " + roleName + ".", "green");
            const me = currentUser();
            if(me.id === user.id){
                me.role = user.role;
                save("currentUser", me);
                location.reload();
            }
        });
        list.append(row);
    }
}


function currentUser(){
    return load("currentUser", null);
}


function applyRole(user){
    if(user.role === "ADMIN"){
        document.querySelector("#current-role").textContent = "Administrator";
    }else{
        document.querySelector("#current-role").textContent = "Educator";
        for(const element of document.querySelectorAll("[data-admin-only]")){
            element.style.display = "none";
        }
        const subtitle = document.querySelector("[data-educator-text]");
        if(subtitle){
            subtitle.textContent = subtitle.dataset.educatorText;
        }
    }
    document.querySelector("#signout").addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        location.href = "Signin.html";
    });
}


const PAGES = {
    signin: setupSignin,
    register: setupRegister,
    registry: setupRegistry,
    add: setupAdd,
    edit: setupEdit,
    details: setupDetails,
    delete: setupDelete,
    statistics: setupStatistics,
    roles: setupRoles
};


function start(){
    const page = document.body.dataset.page;
    const user = currentUser();
    if(page !== "signin" && page !== "register"){
        if(!user){
            location.href = "Signin.html";
            return;
        }
        applyRole(user);
        if(document.body.dataset.access === "admin" && user.role !== "ADMIN"){
            showMessage("Access denied", "Your account does not have permission for this action.");
            return;
        }
    }
    if(PAGES[page]){
        PAGES[page]();
    }
}

start();
