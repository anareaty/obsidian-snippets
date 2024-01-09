await dv.view("_/scripts/views/filter_functions")
const df = new dataviewFunctions
let current = dv.current()
let view = current.view
let views = ["Все заметки", "Картотека", "Сохранено", "Медиа коллекции", "Рецепты", "Писательство", "Блог"]
let defaultView = "Все заметки"
let paginationNum = 20
let filteredPages = []
let props = []
let  newNote = {
		buttonName: "+", 
		fileName: "Новая заметка", 
		templatePath: "_/templates/notes/Пустая заметка.md", 
		folderName: "Входящие", 
		open: true
	}
let pages = dv.pages().filter(p => !p.file.path.startsWith("_/") && !p.file.path.startsWith("_/") && !p.file.path.startsWith("Телефон/templates"))
 


 
await df.changeViewButton(views, "view", defaultView)



let writing_categories = ["Все тексты", "Ориджиналы", "Фанфики"]
let default_writing_category = "Ориджиналы"
let saved_categories = ["Все", "Статьи", "Закладки", "Цитаты"]
let default_saved_category = "Статьи"
let media_categories = ["Все", "Книги", "Фильмы", "Сериалы", "Игры"]
let default_media_category = "Книги"



if (view == "Писательство") {
await df.changeViewButton(writing_categories, "filter_writing_category", default_writing_category)
}
 
if (view == "Сохранено") {
await df.changeViewButton(saved_categories, "filter_saved_category", default_saved_category)
}
 
 
if (view == "Медиа коллекции") {
await df.changeViewButton(media_categories, "filter_media_category", default_media_category)
}
 
 
 
 

 
 
 
 

 
dv.paragraph("    ")
 
 
if (!view) view = defaultView
 
if (view == "Все заметки") {

let canvasPages = await df.getCanvasPages()
pages = pages.concat(canvasPages)
pages = pages.sort(p => p.date, "desc")
 
props = [
{prop: "link", type: "file prop", header: "Название"},
{prop: "type", type: "text", buttonName: "#Тип", header: "Тип"}
]





 
 
 
 
 
} else if (current.view == "Картотека") {
 
 
 
pages = pages.filter(p => p.type == "note")

 
 
props = [
{prop: "link", type: "file prop", header: "Название"},
{prop: "Категория", type: "list", buttonName: "#Категория", header: "Категория"},
{prop: "tags", type: "list", multiSelect: true, buttonName: "#Тэги", header: "Тэги"},
{prop: "Статус", type: "list", buttonName: "#Статус", header: "Статус"}
]
  
 newNote.templatePath = "_/templates/notes/Информационная заметка.md"
 newNote.folderName = "Картотека"
 
 
 
 
 

 
 
} else if (view == "Сохранено") {
 
pages = pages.filter(p => p.type == "saved")
let category = current.filter_saved_category

if (!category) category = default_saved_category
 
 
if (category == "Статьи") {
pages = pages.filter(p => p["saved type"] == "article")
}
 
if (category == "Закладки") {
pages = pages.filter(p => p["saved type"] == "bookmark")
}
 
if (category == "Цитаты") {
pages = pages.filter(p => p["saved type"] == "quote")
}
 

 
props = [
{prop: "link", type: "file prop", header: "Название"},
{prop: "tags", type: "list", multiSelect: true, buttonName: "#Тэги", header: "Тэги"},
{prop: "Прочитано", type: "boolean", buttonName: "#Прочитано", header: "Прочитано"}
]
 
 
 
 
 
 
 
 
 
 
 
 
 
} else if (view == "Медиа коллекции") {
 
pages = pages.filter(p => p.type == "media")
let category = current.filter_media_category

if (!category) category = default_media_category
 

 


if (category == "Книги") {
 pages = pages.filter(p => p["media type"] == "book").sort(p => p.order, "asc")

  newNote.templatePath = "_/templates/notes/collections/Книга.md"
  newNote.folderName = "Коллекции/Книги"
  newNote.fileName = "Новая книга"

 props = [
 {prop: "link", type: "file prop", header: "Название"},
 {prop: "Автор", type: "list", buttonName: "#Автор", header: "Автор"},
 {prop: "Жанр", type: "list", multiSelect: true, buttonName: "#Жанр", header: "Жанр"},
 {prop: "Цикл", type: "text", buttonName: "#Цикл", header: "Цикл"},
 {prop: "Статус чтения", type: "list", buttonName: "#Статус", header: "Статус"},
 {prop: "Оценка", type: "text", buttonName: "#Оценка", header: "Оценка"}
 ]

}
 
 
 
 
 
if (category == "Фильмы") {
pages = pages.filter(p => p["media type"] == "movie")
}
 
if (category == "Сериалы") {
pages = pages.filter(p => p["media type"] == "tv-show")
}
 
if (category == "Игры") {
pages = pages.filter(p => p["media type"] == "game")
}
 

 

 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
} else if (view == "Писательство") {
pages = pages.where(p => p["type"] == "writing").sort(p => p.order, "asc")
let category = current.filter_writing_category

if (!category) category = default_writing_category

let type = current["filter_writing type"]
 
newNote.templatePath = "_/templates/notes/writing/Сцена.md"
newNote.folderName = "Писательство"
newNote.fileName = "Без названия"
 
 
if (category == "Ориджиналы") {
newNote.folderName = "Писательство/Ориджиналы"
 
let story = current["filter_История"]
if (story && story.path) {
 newNote.folderName = story.path.replace(/(.*)(\/[^\/]+)(.md)/, "$1")
}
 
pages = pages.filter(p => !p["Фандом"])
 props = [
 {prop: "link", type: "file prop", header: "Название"},
 {prop: "История", type: "text", buttonName: "#История", header: "История"},
 {prop: "Статус", type: "list", buttonName: "#Статус", header: "Статус"},
 {prop: "writing type", type: "text", buttonName: "#Текст", header: "Текст"}
 ]
}
 
if (category == "Фанфики") {
newNote.folderName = "Писательство/Фанфики"
pages = pages.filter(p => p["Фандом"])
 props = [
 {prop: "link", type: "file prop", header: "Название"},
 {prop: "Фандом", type: "text", buttonName: "#Фандом", header: "Фандом"},
 {prop: "Пейринг", type: "text", buttonName: "#Пейринг", header: "Пейринг"},
 {prop: "Статус", type: "list", buttonName: "#Статус", header: "Статус"},
 ]
}
 
if (category == "Все тексты") {
 props = [
 {prop: "link", type: "file prop", header: "Название"},
 {prop: "История", type: "text", buttonName: "#История", header: "История"},
 {prop: "Фандом", type: "text", buttonName: "#Фандом", header: "Фандом"},
 {prop: "Пейринг", type: "text", buttonName: "#Пейринг", header: "Пейринг"},
 {prop: "Статус", type: "list", buttonName: "#Статус", header: "Статус"},
 {prop: "writing type", type: "text", buttonName: "#Текст", header: "Текст"}
 ]
}
 

 
 
 
 
/*Добавить сцену*/
 
if (type == "scene") {
newNote.templatePath = "_/templates/notes/writing/Сцена.md"
newNote.fileName = "Новая сцена"
}
 
/*Добавить заметку*/
 
if (type == "note") {
newNote.templatePath = "_/templates/notes/writing/Заметка к тексту.md"
}
 
/*Добавить фанфик*/
 
if (category == "Фанфики") {
newNote.templatePath = "_/templates/notes/writing/Сцена.md"
newNote.fileName = "Новый фанфик"
}
 
 
/*Добавить стихи*/
 
if (type == "poetry") {
newNote.folderName = "Писательство/Стихи"
newNote.templatePath = "_/templates/notes/writing/Стихотворение.md"
newNote.fileName = "Новое стихотворение"
}
 
 
/*Добавить ориджинал*/
 
if (type == "story board") {
newNote.templatePath = "_/templates/notes/writing/Ориджинал.md"
}
 
 

 
 
 
 
 
 
 
 
 
 
 
 
 
} else if (view == "Блог") {
 
 
 
pages = pages.filter(p => p.type == "page").filter(p => !p.file.path.startsWith("_")).sort(p => p.date, "desc")


let icon = document.createElement("span")
let svgText = '<svg style="vertical-align: middle" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>'
icon.innerHTML = (svgText)
 
 
props = [
{prop: "link", type: "file prop", header: "Название"},
{prop: "Блог", type: "text", buttonName: "#Блог", header: "Блог"},
{prop: "tags", type: "list", multiSelect: true, buttonName: "#Тэги", header: "Тэги"},
{prop: "Статус", type: "list", buttonName: "#Статус", header: "Статус", span: true},
{prop: "share", type: "boolean", buttonName: icon, header: svgText}
]
 


 
 

 
newNote.templatePath = "_/templates/notes/Страница на сайт.md"
newNote.folderName = "Писательство/Блоги"
newNote.fileName = "Новая страница"
 
 
 
 
 
 
 
 
 
 
 
} else if (view == "Рецепты") {
 
	pages = pages.filter(p => p.type == "recipe").filter(p => !p.file.path.startsWith("_")).sort(p => p["Тип блюда"], "desc")

	props = [
	{prop: "link", type: "file prop", header: "Название"},
	{prop: "Тип блюда", type: "text", buttonName: "#Тип блюда", header: "Тип блюда"},
	{prop: "Ингридиенты", type: "list", multiSelect: true, buttonName: "#Ингридиенты", header: "Ингридиенты"}
	] 

	newNote.templatePath = "_/templates/notes/collections/Рецепт.md"
	newNote.folderName = "Коллекции/Рецепты"
	newNote.fileName = "Новый рецепт"
}

filteredPages = [...pages]
await df.newEntryButton(newNote)
await df.createList(props, pages, filteredPages, paginationNum)
 

