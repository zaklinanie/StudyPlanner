document.addEventListener('DOMContentLoaded', function () {
    const creditsList = document.getElementById('credits-list');
    const examsList = document.getElementById('exams-list');
    const addButton = document.querySelectorAll('.add-button');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close-button');
    const modalForm = document.getElementById('modal-form');
    const itemTypeInput = document.getElementById('item-type');
    const calendarDiv = document.getElementById('calendar');

    let items = {
        credits: [],
        exams: []
    };

    const storedItems = localStorage.getItem('items');
    if (storedItems) {
        items = JSON.parse(storedItems);
        renderItems();
        renderCalendar(new Date());
    }

    addButton.forEach(button => {
        button.addEventListener('click', () => {
            itemTypeInput.value = button.dataset.type;
            document.getElementById('modal-title').textContent = `Добавить ${button.dataset.type === 'credit' ? 'зачет' : 'экзамен'}`;
            modal.classList.add('show');
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
        modalForm.reset();
    });
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.classList.remove('show');
            modalForm.reset();
        }
    });
   modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
       const itemName = document.getElementById('item-name').value;
        const itemDate = document.getElementById('item-date').value;
        const itemTime = document.getElementById('item-time').value;
        const itemTeacher = document.getElementById('item-teacher').value;
        const itemType = itemTypeInput.value;
        const newItem = {
            id: Date.now(),
            name: itemName,
            date: `${itemDate}T${itemTime}`,
            teacher: itemTeacher,
            assignments: [],
            completed: [],
            notes: []
        };

        items[itemType + 's'].push(newItem);
       renderItems();  
       renderCalendar(new Date());
        modal.classList.remove('show');
        modalForm.reset();
        saveDataToLocalStorage();
    });
  function renderItems() {
    creditsList.innerHTML = '';
    examsList.innerHTML = '';
    items.credits.forEach(credit => renderItem(credit, creditsList, 'credit'));
    items.exams.forEach(exam => renderItem(exam, examsList, 'exam'));
 }
 let currentOpenItemId = null; 
     function renderItem(item, listElement, type) {
        const itemBlock = document.createElement('div');
      itemBlock.classList.add('item-block');
       itemBlock.setAttribute('data-id', item.id)
        const itemDate = new Date(item.date);
          const now = new Date();
          if(itemDate < now){
              itemBlock.classList.add('past-event');
           }
        const itemHeader = document.createElement('div');
        itemHeader.classList.add('item-header');
        itemBlock.appendChild(itemHeader);

        const removeButton = document.createElement('button');
        removeButton.classList.add('item-remove-button');
        removeButton.innerHTML = '<i class="fas fa-times"></i>';
        itemBlock.appendChild(removeButton);
        removeButton.addEventListener('click', function () {
            removeItem(item.id, type);
        });

        const header = document.createElement('h3');
        header.textContent = item.name;
        itemHeader.appendChild(header);
        
        const teacherSpan = document.createElement('span');
        teacherSpan.classList.add('teacher-name');
         teacherSpan.textContent = `(${item.teacher})`;
        itemHeader.appendChild(teacherSpan);

        const arrowIcon = document.createElement('span');
        arrowIcon.classList.add('arrow', 'fas', 'fa-chevron-down');
        itemHeader.appendChild(arrowIcon);

        const dateElement = document.createElement('span');
        const formattedDate = itemDate.toLocaleDateString();
        dateElement.classList.add('item-date');
        dateElement.textContent = formattedDate;


          const timeLeft = calculateTimeLeft(itemDate);
        const timeLeftElement = document.createElement('span');
       timeLeftElement.classList.add('time-left');
         timeLeftElement.innerHTML = `Осталось: <br> ${timeLeft.days} дней ${timeLeft.hours} часов`;
         dateElement.appendChild(timeLeftElement);
        itemHeader.appendChild(dateElement);

        const content = document.createElement('div');
        content.classList.add('item-content');
        itemBlock.appendChild(content);
        const assignmentHeader = document.createElement('h4');
        assignmentHeader.textContent = "Задания";
        content.appendChild(assignmentHeader)

        const assignmentList = document.createElement('div');
        assignmentList.classList.add('file-list');
        content.appendChild(assignmentList)
        const assignmentUl = document.createElement('ul');
        assignmentList.appendChild(assignmentUl);

        item.assignments.forEach((file, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href='${file.url}' download="${file.name}" class="file-link">${file.name}</a>
             <button data-id='${index}' data-type="assignment" class='remove-file'>Удалить</button>
            `;
            assignmentUl.appendChild(listItem);
        });


        const completedHeader = document.createElement('h4');
        completedHeader.textContent = "Выполнено";
        content.appendChild(completedHeader)

        const completedList = document.createElement('div');
        completedList.classList.add('file-list');
        content.appendChild(completedList)
        const completedUl = document.createElement('ul');
        completedList.appendChild(completedUl);
        item.completed.forEach((file, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href='${file.url}' download="${file.name}" class="file-link">${file.name}</a>
           <button data-id='${index}' data-type="completed" class='remove-file'>Удалить</button>
            `;
            completedUl.appendChild(listItem);
        });

        const notesHeader = document.createElement('h4');
        notesHeader.textContent = "Заметки";
        content.appendChild(notesHeader);
         const notesSection = document.createElement('div');
        notesSection.classList.add('notes-section');
        content.appendChild(notesSection);

        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Введите заметку';
        notesSection.appendChild(textarea);
        const addNoteButton = document.createElement('button');
       addNoteButton.textContent = 'Добавить заметку';
        notesSection.appendChild(addNoteButton);

        const notesList = document.createElement('ul');
         notesList.classList.add('notes-list');
         content.appendChild(notesList);
         item.notes.forEach((note, index) => {
            const noteItem = document.createElement('li');
             const noteDate = new Date(note.date);
            const formattedNoteDate = noteDate.toLocaleDateString() + " " + noteDate.toLocaleTimeString();
             noteItem.innerHTML = `<span class='note-date'>${formattedNoteDate}</span><p class="note-text">${note.text}</p><button data-id='${index}' data-type="note"  class='remove-note'>Удалить</button>`;
                notesList.appendChild(noteItem);
         });


        itemHeader.addEventListener('click', () => {
            if(currentOpenItemId === item.id){
                 content.classList.remove('show');
                 arrowIcon.classList.remove('rotate');
                 currentOpenItemId = null;
            }
            else{
                const openContents = document.querySelectorAll('.item-content.show');
                openContents.forEach(content => {
                       content.classList.remove('show');
                      const arrowIcon = content.closest('.item-block').querySelector('.arrow');
                      arrowIcon.classList.remove('rotate');
                });
                content.classList.add('show');
                 arrowIcon.classList.add('rotate');
                currentOpenItemId = item.id;
           }

        });
        const fileInputs = document.createElement('div');
        fileInputs.innerHTML = `
         <h4>Загрузить задание</h4>
         <input type="file" data-type="assignments"  class="file-input">
           <h4>Загрузить выполненное</h4>
          <input type="file" data-type="completed" class="file-input">
        `;
        content.appendChild(fileInputs);
         addNoteButton.addEventListener('click', function () {
          const noteText = textarea.value.trim();
          if(noteText){
               const newNote = {
                   date: Date.now(),
                    text: noteText
               }
            const itemBlock =  addNoteButton.closest('.item-block')
            const itemId = itemBlock.getAttribute('data-id');
             let currentItem
           items.credits.forEach(credit => {
                if (credit.id == itemId) {
                      currentItem = credit
                }
            });
            items.exams.forEach(exam => {
                if(exam.id == itemId){
                    currentItem = exam;
                }
            })
           currentItem.notes.push(newNote);
           const openItem =  document.querySelector(`.item-block[data-id="${itemId}"] .item-content`);
                if (openItem) {
                     openItem.classList.add('show');
                     const arrowIcon = openItem.closest('.item-block').querySelector('.arrow');
                    arrowIcon.classList.add('rotate');
                }
             currentOpenItemId = itemId; 
            renderItems();
            saveDataToLocalStorage();
            textarea.value = "";
          }
      });
        fileInputs.addEventListener('change', function(event){
            if(event.target.classList.contains('file-input')){
                 const fileInput = event.target;
                const fileType = fileInput.dataset.type;
                if(fileInput.files && fileInput.files[0]){
                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    reader.onload = function(e){
                      const fileData = {
                           name: file.name,
                            url: e.target.result
                       }
                        const itemBlock =  fileInput.closest('.item-block')
                          const itemId = itemBlock.getAttribute('data-id');
                          let currentItem
                           items.credits.forEach(credit => {
                              if (credit.id == itemId) {
                                currentItem = credit
                            }
                        });
                        items.exams.forEach(exam => {
                            if(exam.id == itemId){
                                currentItem = exam;
                            }
                        })
                            currentItem[fileType].push(fileData);
                           const openItem =  document.querySelector(`.item-block[data-id="${itemId}"] .item-content`);
                            if (openItem) {
                                 openItem.classList.add('show');
                                 const arrowIcon = openItem.closest('.item-block').querySelector('.arrow');
                                arrowIcon.classList.add('rotate');
                            }
                            currentOpenItemId = itemId; 
                            renderItems();
                            saveDataToLocalStorage();
                   }
                   reader.readAsDataURL(file);
                }
            }
        })
         notesList.addEventListener('click', function (event){
            if(event.target.classList.contains('remove-note')){
               const noteId = event.target.dataset.id;
               const itemBlock =  event.target.closest('.item-block')
               const itemId = itemBlock.getAttribute('data-id');
                  let currentItem
                 items.credits.forEach(credit => {
                    if (credit.id == itemId) {
                          currentItem = credit
                    }
                });
                items.exams.forEach(exam => {
                    if(exam.id == itemId){
                        currentItem = exam;
                    }
                })
                  currentItem.notes.splice(noteId, 1);
                 const openItem =  document.querySelector(`.item-block[data-id="${itemId}"] .item-content`);
                     if (openItem) {
                         openItem.classList.add('show');
                          const arrowIcon = openItem.closest('.item-block').querySelector('.arrow');
                        arrowIcon.classList.add('rotate');
                    }
                   renderItems();
                 saveDataToLocalStorage();
           }
        });
       assignmentList.addEventListener('click', function (event){
           if(event.target.classList.contains('remove-file')){
               const fileId = event.target.dataset.id;
               const itemBlock =  event.target.closest('.item-block')
               const itemId = itemBlock.getAttribute('data-id');
               let currentItem
                  items.credits.forEach(credit => {
                    if (credit.id == itemId) {
                          currentItem = credit
                    }
                });
                items.exams.forEach(exam => {
                    if(exam.id == itemId){
                        currentItem = exam;
                    }
                })
                currentItem.assignments.splice(fileId, 1);
               const openItem =  document.querySelector(`.item-block[data-id="${itemId}"] .item-content`);
                     if (openItem) {
                          openItem.classList.add('show');
                          const arrowIcon = openItem.closest('.item-block').querySelector('.arrow');
                           arrowIcon.classList.add('rotate');
                     }
                renderItems();
                  saveDataToLocalStorage();
          }
       });
       completedList.addEventListener('click', function (event){
          if(event.target.classList.contains('remove-file')){
                const fileId = event.target.dataset.id;
                  const itemBlock =  event.target.closest('.item-block')
                   const itemId = itemBlock.getAttribute('data-id');
                   let currentItem
                      items.credits.forEach(credit => {
                        if (credit.id == itemId) {
                            currentItem = credit
                        }
                    });
                    items.exams.forEach(exam => {
                        if(exam.id == itemId){
                            currentItem = exam;
                        }
                    })
                currentItem.completed.splice(fileId, 1);
              const openItem =  document.querySelector(`.item-block[data-id="${itemId}"] .item-content`);
                if (openItem) {
                     openItem.classList.add('show');
                      const arrowIcon = openItem.closest('.item-block').querySelector('.arrow');
                      arrowIcon.classList.add('rotate');
                 }
              renderItems();
                saveDataToLocalStorage();
          }
      });

       listElement.appendChild(itemBlock);
    }
     function calculateTimeLeft(date) {
        const now = new Date();
        const timeDiff = date.getTime() - now.getTime();
       let days = Math.floor(timeDiff / (1000 * 3600 * 24));
        let hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
        if (days < 0) {
            days = 0;
            hours = 0
        }
         return {
            days: days,
           hours: hours
       };
    }
    function removeItem(itemId, type) {
        items[type + 's'] = items[type + 's'].filter(item => item.id !== itemId);
        renderItems();
         renderCalendar(new Date());
         saveDataToLocalStorage();
    }

    function saveDataToLocalStorage() {
        localStorage.setItem('items', JSON.stringify(items));
    }
    function renderCalendar(selectedDate) {
        const today = new Date();
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        let calendarHTML = '<table><thead><tr>';
        const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        daysOfWeek.forEach(day => {
            calendarHTML += `<th>${day}</th>`;
        });
        calendarHTML += '</tr></thead><tbody><tr>';

        let dayCounter = 1;
        let nextMonthDayCounter = 1;
         for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                  if (i === 0 && j < firstDayOfWeek) {
                   calendarHTML += '<td></td>';
                } else if (dayCounter <= daysInMonth) {
                     const currentDate = new Date(year, month, dayCounter);
                   const formattedDate = currentDate.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

                    let eventType = null;
                   let eventName = null;
                     items.credits.forEach(credit => {
                        if (credit.date.startsWith(formattedDate)) {
                            eventType = 'credit';
                             eventName = credit.name;
                        }
                    });
                    items.exams.forEach(exam => {
                        if (exam.date.startsWith(formattedDate)) {
                             eventType = 'exam';
                             eventName = exam.name;
                        }
                    });
                     let cellClasses = eventType ? `event event-${eventType}` : '';
                    let tooltipHtml = eventName ? `<span class="tooltip">${eventName}</span>` : '';
                  calendarHTML += `<td class="${cellClasses}" data-date="${formattedDate}">${dayCounter}${tooltipHtml}</td>`;
                   dayCounter++;
                 } else if(nextMonthDayCounter <= 2){
                      const nextMonthDate = new Date(year, month + 1, nextMonthDayCounter);
                     const formattedNextMonthDate = nextMonthDate.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
                       let eventType = null;
                      let eventName = null;
                    items.credits.forEach(credit => {
                       if (credit.date.startsWith(formattedNextMonthDate)) {
                           eventType = 'credit';
                             eventName = credit.name;
                        }
                    });
                    items.exams.forEach(exam => {
                       if (exam.date.startsWith(formattedNextMonthDate)) {
                            eventType = 'exam';
                             eventName = exam.name;
                       }
                  });
                     let cellClasses = eventType ? `event event-${eventType} next-month-day` : 'next-month-day';
                     let tooltipHtml = eventName ? `<span class="tooltip">${eventName}</span>` : '';
                       calendarHTML += `<td class="${cellClasses}" data-date="${formattedNextMonthDate}">${nextMonthDayCounter}${tooltipHtml}</td>`;
                    nextMonthDayCounter++;
                }
                else {
                   calendarHTML += '<td></td>';
               }
           }
             if (dayCounter > daysInMonth && nextMonthDayCounter > 2) break;
            calendarHTML += '</tr><tr>';
        }
        calendarHTML += '</tr></tbody></table>';
        calendarDiv.innerHTML = calendarHTML;
    }
});