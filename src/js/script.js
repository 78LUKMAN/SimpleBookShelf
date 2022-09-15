const UNREADBOOK = "unreadBook";
const READBOOK = "readBook";
const STGKEY = "BOOK_SHELF";
let bookDatas = [];

document.addEventListener("DOMContentLoaded", () => {
    const formUserInput = document.getElementById('inputBook')
    const searchInput = document.getElementById('searchBook')

    formUserInput.addEventListener("submit", (event) => {
        event.preventDefault()
        addBookData()
        clearForm()
    })

    searchInput.addEventListener("keyup", () => {
        const inputSearch = document.getElementById('searchTitle').value
        bookDataSearch(inputSearch)
    })

    if (storageSupport()) {
        getDatas()
    }
})

document.addEventListener("gotData", () => {
    renderDatas();
})


function addBookData() {
    const bookID = +new Date()
    const bookTitle = document.getElementById('inputTitle').value;
    const bookAuthor = document.getElementById('inputAuthor').value;
    const bookYear = document.getElementById('inputYear').value;
    const isRead = document.getElementById('isRead').checked;

    const bookEl = createEl(bookID, bookTitle, bookAuthor, bookYear, isRead)
    const bookDataObject = createObjectItem(bookID, bookTitle, bookAuthor, bookYear, isRead)

    bookDatas.push(bookDataObject)

    if (isRead) {
        document.getElementById(READBOOK).append(bookEl)
    } else {
        document.getElementById(UNREADBOOK).append(bookEl)
    }

    updateDatas()
}

function clearForm() {
    document.getElementById('inputTitle').value = "";
    document.getElementById('inputAuthor').value = "";
    document.getElementById('inputYear').value = "";
    document.getElementById('isRead').checked = false
}


function createEl(bookID, bookTitle, bookAuthor, bookYear, isRead) {
    document.getElementById(UNREADBOOK).classList.add("d-flex", "col", "flex-wrap", "gap-5", "justify-content-center")
    document.getElementById(READBOOK).classList.add("d-flex", "col", "flex-wrap", "gap-5", "justify-content-center")
    const bookContainer = document.createElement("article")
    bookContainer.setAttribute("id", bookID)
    bookContainer.classList.add("card", "my-3")

    const elTitle = document.createElement("h3")
    elTitle.classList.add("text-truncate")
    elTitle.style.maxWidth = "200px"
    elTitle.innerText = bookTitle
    const elID = document.createElement("p")
    elID.innerText = "id : " + bookID
    elID.style.fontSize = "12px"

    const elAuthor = document.createElement("h5")
    elAuthor.classList.add("text-truncate", "d-inline-block")
    elAuthor.style.maxWidth = "200px"
    elAuthor.innerText = bookAuthor

    const elYear = document.createElement("p")
    elYear.innerText = bookYear

    const br = document.createElement("br")

    const displayData = document.createElement("div")
    displayData.classList.add("card-body", "border")

    const cardBox = document.createElement("div")
    cardBox.classList.add("card-content")
    cardBox.append(elTitle, elID, elAuthor, elYear)

    const userActionBtn = buttonAction(isRead, bookID)
    displayData.append(cardBox)
    displayData.append(userActionBtn)
    bookContainer.append(displayData)

    return bookContainer;
}

function buttonAction(isRead, bookID) {
    const ActionBtn = document.createElement("div")

    const deleteBtn = deleteAction(bookID)
    const readBtn = readAction(bookID)
    const undoBtn = undoAction(bookID)

    ActionBtn.append(deleteBtn)

    if (isRead) {
        ActionBtn.append(undoBtn)
    } else {
        ActionBtn.append(readBtn)
    }
    return ActionBtn;
}

function deleteAction(bookID) {
    const deleteBtn = document.createElement("button")
    deleteBtn.classList.add("btn", "btn-sm", "btn-outline-danger", "mx-1", "delBtn")
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>'

    deleteBtn.addEventListener("click", () => {
        let userConfirm = confirm("Apakah anda yakin ingin menghapus item ini ?")
        if (userConfirm) {
            const mainCard = document.getElementById(bookID)
            mainCard.addEventListener("usrDelAction", (event) => {
                event.target.remove();
            });
            mainCard.dispatchEvent(new Event("usrDelAction"))
            deleteBookDatas(bookID)
            updateDatas()
        }

    })

    return deleteBtn;
}

function readAction(bookID) {
    const readBtn = document.createElement("button")
    readBtn.classList.add("btn", "btn-outline-primary", "btn-sm")
    readBtn.innerHTML = '<i class="bi bi-check2"></i>'

    readBtn.addEventListener("click", () => {
        const mainCard = document.getElementById(bookID)

        const bookTitle = mainCard.querySelector(".card-content > h3").innerText;
        const bookAuthor = mainCard.querySelectorAll(".card-content > h5")[0].innerText;
        const bookYear = mainCard.querySelectorAll(".card-content > p")[0].innerText;
        mainCard.remove()

        const bookDataObject = createEl(bookID, bookTitle, bookAuthor, bookYear, true)
        document.getElementById(READBOOK).append(bookDataObject)

        deleteBookDatas(bookID)
        const bookItem = createObjectItem(bookID, bookTitle, bookAuthor, bookYear, true)

        bookDatas.push(bookItem)
        updateDatas()
    })

    return readBtn;
}

function undoAction(bookID) {
    const undoBtn = document.createElement("button")
    undoBtn.textContent = "Pindah Rak"
    undoBtn.classList.add("btn", "btn-sm", "btn-outline-secondary")

    undoBtn.addEventListener("click", () => {
        const mainCard = document.getElementById(bookID)

        const bookTitle = mainCard.querySelector(".card-content > h3").innerText;
        const bookAuthor = mainCard.querySelectorAll(".card-content > h5")[0].innerText;
        const bookYear = mainCard.querySelectorAll(".card-content > p")[0].innerText;

        mainCard.remove()

        const bookEl = createEl(bookID, bookTitle, bookAuthor, bookYear, false)
        document.getElementById(UNREADBOOK).append(bookEl)

        deleteAction(bookID)
        const bookDataObject = createObjectItem(bookID, bookTitle, bookAuthor, bookYear, false)

        bookDatas.push(bookDataObject)
        updateDatas()
    })
    return undoBtn
}

function bookDataSearch(schkey) {
    const filterKey = schkey.toUpperCase()
    const filterTitle = document.getElementsByTagName("h3")

    for (let index = 0; index < filterTitle.length; index++) {
        const inputTextTitle = filterTitle[index].textContent || filterTitle[index].innerText

        if (inputTextTitle.toUpperCase().indexOf(filterKey) > -1) {
            filterTitle[index].closest(".card").style.display = ""
        } else {
            filterTitle[index].closest(".card").style.display = "none"
        }
    }
}

// STORAGE CONFIG CODE
function storageSupport() {
    if (typeof (Storage) === "undefined") {
        alert("BROWSER TIDAK MENDUKUNG WEB STORAGE")
        return false
    } else {
        return true
    }
}

function updateDatas() {
    if (storageSupport()) {
        localStorage.setItem(STGKEY, JSON.stringify(bookDatas))
    }
}

function getDatas() {
    let dataItem = JSON.parse(localStorage.getItem(STGKEY))

    if (dataItem !== null) {
        bookDatas = dataItem;
    }

    document.dispatchEvent(new Event("gotData"));
}

function createObjectItem(id, title, author, year, isRead) {
    return {
        id,
        title,
        author,
        year,
        isRead,
    };
}
function renderDatas() {
    for (bookData of bookDatas) {
        const newBook = createEl(bookData.id, bookData.title, bookData.author, bookData.year, bookData.isRead)

        if (bookData.isRead) {
            document.getElementById(READBOOK).append(newBook)
        } else {
            document.getElementById(UNREADBOOK).append(newBook)
        }
    }
}

function deleteBookDatas(bookID) {
    for (let dataArr = 0; dataArr < bookDatas.length; dataArr++) {
        if (bookDatas[dataArr].id == bookID) {
            bookDatas.splice(dataArr, 1)
            break;
        }
    }
}