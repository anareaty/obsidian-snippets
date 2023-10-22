Этот скрипт для dataviewjs помогает создавать в Обсидиане таблицы с фильтрами и паджинацией, а также добавляет несколько других полезных функций. Большая часть кода вынесена в отдельный файл для удобства переиспользования и чтобы не загромождать заметку.

Для использования скрипта необходимо установить плагины:

- Dataview;
- CustomJS;
- Templater;
- Buttons.

Как настроить:

1. Скачайте [этот файл](https://github.com/anareaty/obsidian-snippets-templates-and-scripts/blob/main/jvjs-table/dvFunctions.js) и положите его в своё хранилище Обсидиана, в любую папку.
2. В настройках плагина CustomJS укажите путь к этому файлу.
3. В папке шаблонов создайте пустой шаблон и укажите его как startup template в настройках плагина Templater. Если у вас уже есть какой-то startup template, то этот шаг можно пропустить.
4. В заметку, где вы хотите создать таблицу, скопируйте этот код и отредактируйте его как вам нужно:

````
```dataviewjs

const {df} = customJS
let current = dv.current()

// Добавьте фильтры при необходимости
let pages = dv.pages()
let filteredPages = [...pages]


// Выберите, сколько файлов будет отображаться на странице
let paginationNum = 20


// Добавьте фильтры для свойств
// Уберите знак комментария с фильтров, которые хотите использовать. Используйте разные функции для разных типов свойств.

// filteredPages = await df.filterFunction("text property", current, filteredPages)
// filteredPages = await df.filterFunctionMulti("list property", current, filteredPages)
// filteredPages = await df.filterFunctionTags(current, filteredPages)
// filteredPages = await df.filterFunctionBool("boolean property", current, filteredPages)
// filteredPages = await df.filterFunctionFile("file metadata", current, filteredPages)



// Добавьте кнопку для создания новой заметки в таблице. Используйте true, чтобы заметка автоматически открывалась при создании или false, чтобы не открывалась.

await df.newEntryButton("button name", "file name", "template", "folder", true, this)



// Добавьте кнопки для фильтов
// Используйте разные кнопки для разных типов свойств.

// await df.filterButton("#text property", "text property", this, pages)
// await df.filterButtonMulti("#list property", "list property", this, pages)
// await df.filterButtonTags("#tags", this, pages)
// await df.filterButtonBool("#boolean property", "boolean property", this, pages)
// await df.filterButtonFile("#file metadata", "file metadata", this, pages)



// Добавьте кнопки паджинации

await df.paginationBlock(filteredPages, paginationNum, this)
filteredPages = await df.paginate(filteredPages, paginationNum, current)


// Добавьте заголовки таблицы

let headers = [ 
    "file",
    "text property",
    "list property",
    "tags",
    "link property",
    "boolean property",
    "file metadata",
    "task progress"
]


// Создайте строки таблицы. Здесь можно использовать несколько дополнительных функций для лучшего отображения свойств. 
// df.joinTags() отображает тэги в одру строку
// df.spanList() отображает метаданные типа "список" в одну строку и оборачивает их в спаны с отдельными классами. Это позволяет потом использовать css, чтобы, например, сделать разные метаданные разного цвета и т.п.
// df.spanSingle() оборачивает текстровые метаданные в спаны с отдельными классами
// df.createLinks() позволяет рендерить ссылки
// df.renderBoolean() отображает свойства типа true и false в виде кликабельных чекбоксов (клик по чекбоксу изменит свойство в самом файле) 
// df.taskProgress(p) создаёт прогресс-бар на основе выполненнных и невыполненных задач в файле

let rows = filteredPages.map(p => [
	p.file.link, 
	df.spanSingle(p["text property"]),
	df.spanList(p["list property"]),
	df.joinTags(p.file.tags),
	df.createLink("link name", p["link property"]),
	df.renderBoolean(p, "boolean property"),
	p.file.path,
	df.taskProgress(p)
])

dv.paragraph(" ")

dv.table(headers, rows)
```
````