It is the script for dataviewjs that helps to create tables in Obsidian with filters and pagination. It also adds some other useful functions. Most of the code is put to the separate file to to make it reusable and avoin cluttering your note.

Demo:

![Образец-таблицы-с-фильтрами-и-паджинацией-Obsidian-Obsidian-v1 4 5-2023-09-04-19-58-07](https://github.com/anareaty/obsidian-snippets-templates-and-scripts/assets/55949830/cb27d390-093f-4a86-ad77-f659b3b01046)

Plugins required for the script to work:

- Dataview;
- CustomJS;
- Templater;
- Buttons.

Setup:

1. Download the file from this link: https://github.com/anareaty/obsidian-snippets-templates-and-scripts/blob/main/jvjs-table/dvFunctions.js. Put downloaded file in any folder in your Obsidian vault.
2. In CustomJS plugin's settings write the path to this file.
3. Create an empty template in your templates folder an chose it as startup template it Templater plugin's settings. Skip this step if you olready have some startup template.
4. Copy this code and paste it to the dataviewjs codeblock in your note. Edit it, according to your needs.

````js
```dataviewjs

const {df} = customJS
let current = dv.current()



// You can edit your query here
let pages = dv.pages()
let filteredPages = [...pages]



// Select number of entries on the page
let paginationNum = 20



// Apply filters
// Uncomment filter functions for the properties you want to filter. Use different functions for the different types of data.

// filteredPages = await df.filterFunction("text property", current, filteredPages)
// filteredPages = await df.filterFunctionMulti("list property", current, filteredPages)
// filteredPages = await df.filterFunctionTags(current, filteredPages)
// filteredPages = await df.filterFunctionBool("boolean property", current, filteredPages)
// filteredPages = await df.filterFunctionFile("file metadata", current, filteredPages)



// Add button for creating new note. Use true to open file on creation, or false to not open it.

await df.newEntryButton("button name", "file name", "template", "folder", true, this)



// Add filter buttons
// Uncomment button functions for the properties you want to filter. Use different buttonss for the different types of data.

// await df.filterButton("#text property", "text property", this, pages)
// await df.filterButtonMulti("#list property", "list property", this, pages)
// await df.filterButtonTags("#tags", this, pages)
// await df.filterButtonBool("#boolean property", "boolean property", this, pages)
// await df.filterButtonFile("#file metadata", "file metadata", this, pages)



// Add pagination buttons (don't change this).

await df.paginationBlock(filteredPages, paginationNum, this)
filteredPages = await df.paginate(filteredPages, paginationNum, current)


// Add table headers

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


// Create rows. There are some optional functions for decoration.
// Use df.joinTags() to render tags in one line
// Use df.spanList() to render list properties in one line and wrap them in spans with individual classes (can be used to make them different colors with css)
// Use df.spanSingle() to wrap text properties in spans with individual classes
// Use df.createLinks() to render link properties
// Use df.renderBoolean() for booleans to render them as clickable checkboxes (click will affect the actual property in the file)
// Use df.taskProgress(p) to create the progress bar of all tasks in file

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
