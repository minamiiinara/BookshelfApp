const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() /* boolean */ {
  return typeof Storage !== 'undefined';
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function performSearch(searchText) {
  const uncompletedBOOKList = document.getElementById('uncompleted-books');
  const listCompleted = document.getElementById('completed-books');

  uncompletedBOOKList.innerHTML = '';
  listCompleted.innerHTML = '';

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchText.toLowerCase())
  );

  for (const bookItem of filteredBooks) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isCompleted) {
      listCompleted.append(bookElement);
    } else {
      uncompletedBOOKList.append(bookElement);
    }
  }
}

function makeBook(bookObject) {
    const { id, title, author, year, isCompleted } = bookObject;
  
    const textTitle = document.createElement('h2');
    textTitle.innerText = title;
    textTitle.classList.add('font-bold');
  
    const textAuthor = document.createElement('p');
    textAuthor.innerText = author;
  
    const textYear = document.createElement('p');
    textYear.innerText = year;
  
    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textYear);
  
    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `book-${id}`);
  
    if (isCompleted) {
      container.classList.add('have-read-container');
  
      const markAsUnreadButton = document.createElement('button');
      markAsUnreadButton.innerText = 'Mark as Unread';
      markAsUnreadButton.classList.add('bg-ijo', 'hover:bg-ijo/80', 'rounded', 'px-6', 'py-2', 'mt-5', 'font-bold', 'text-white', 'md:justify-start');
      markAsUnreadButton.addEventListener('click', function () {
        undoBookFromCompleted(id);
      });
  
      const deleteButton = document.createElement('button');
      deleteButton.innerText = 'Delete';
      deleteButton.classList.add('border', 'border-ijo', 'hover:bg-ijo/80', 'rounded', 'px-6', 'py-2', 'ml-2', 'mt-5', 'font-bold', 'text-white', 'md:justify-end');
      deleteButton.addEventListener('click', function () {
        showDeleteConfirmation(bookObject.id);
      });
  
      const buttonContainer = document.createElement('div');
      buttonContainer.appendChild(markAsUnreadButton);
      buttonContainer.appendChild(deleteButton);
  
      container.append(buttonContainer);
    } else {
      container.classList.add('have-not-read-container');
  
      const markAsReadButton = document.createElement('button');
      markAsReadButton.innerText = 'Mark as Read';
      markAsReadButton.classList.add('bg-ijo', 'hover:bg-ijo/80', 'rounded', 'px-6', 'py-2', 'mt-5', 'font-bold', 'text-white');
      markAsReadButton.addEventListener('click', function () {
        addBookToCompleted(id);
      });
  
      const buttonContainer = document.createElement('div');
      buttonContainer.appendChild(markAsReadButton);
  
      const deleteButton = document.createElement('button');
      deleteButton.innerText = 'Delete';
      deleteButton.classList.add('border', 'border-ijo', 'hover:bg-ijo/80', 'rounded', 'px-6', 'py-2', 'ml-2', 'mt-5', 'font-bold', 'text-white');
      deleteButton.addEventListener('click', function () {
        showDeleteConfirmation(bookObject.id);
      });
  
      buttonContainer.appendChild(deleteButton);
      container.append(buttonContainer);
    }
  
    return container;
  }
  
  

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function addBook() {
  const textBook = document.getElementById('title').value;
  const textAuthor = document.getElementById('author').value;
  const textYear = parseInt(document.getElementById('year').value, 10);
  const isRead = document.getElementById('checkbox1').checked;
  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, textBook, textAuthor, textYear, isRead);
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}


function showDeleteConfirmation(bookId) {
  const bookToDelete = findBook(bookId);
  if (!bookToDelete) return;

  Swal.fire({
    title: `Are you sure you want to delete "${bookToDelete.title}"?`,
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      removeBookFromCompleted(bookId);
      Swal.fire('Deleted!', 'Your book has been deleted.', 'success');
    }
  });
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('form');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  const searchInput = document.getElementById('search');
  const searchButton = document.getElementById('searchButton');
  searchButton.addEventListener('click', function () {
    const searchText = searchInput.value;
    performSearch(searchText);
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById('uncompleted-books');
  const listCompleted = document.getElementById('completed-books');

  uncompletedBOOKList.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isCompleted) {
      listCompleted.append(bookElement);
    } else {
      uncompletedBOOKList.append(bookElement);
    }
  }
});
