// Put this code to the jataviewjs block

// Path to the script file
await dv.view("_/scripts/views/filter_functions")
const df = new dataviewFunctions
let current = dv.current()
let view = current.view
let views = ["Картотека", "Рецепты", "Блог"]
let defaultView = "Картотека"
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
let pages = dv.pages()
 
await df.changeViewButton(views, "view", defaultView)

 
dv.paragraph("    ")
 
 
if (!view) view = defaultView
 
if (current.view == "Картотека") {

pages = pages.filter(p => p.type == "note")

props = [
{prop: "link", type: "file prop", header: "Название"},
{prop: "Категория", type: "list", buttonName: "#Категория", header: "Категория"},
{prop: "tags", type: "list", multiSelect: true, buttonName: "#Тэги", header: "Тэги"},
{prop: "Статус", type: "list", buttonName: "#Статус", header: "Статус"}
]
  
 newNote.templatePath = "_/templates/notes/Информационная заметка.md"
 newNote.folderName = "Картотека"
 
 
 
 
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
await df.createTable(props, pages, filteredPages, paginationNum)

  
