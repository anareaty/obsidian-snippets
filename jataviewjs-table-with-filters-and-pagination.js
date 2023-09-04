
// Don't change this code

const {createButton} = app.plugins.plugins["buttons"]
const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object

let current = dv.current()
let currentFile = app.vault.getAbstractFileByPath(current.file.path)


const changeFilter = async(prop) => {
  let propName = "filter_" + prop
  let values = pages.map(p => p[prop])
  values = [...new Set(values)]
  values.sort()
  values.unshift("all")
  let valueNames = values.map((v) => {
	  if (v == null) {
	    return "-"
	  } else if (v == "all") {
	    return "-все-"
	  } else {
	    return v
	  }
  })
  

  let val = await tp.system.suggester(valueNames, values)
  if (!val) {val = "-"}
    app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
		frontmatter[propName] = val
		frontmatter.pagination = 0
	})
  }




const changeFilterMulti = async(prop) => {
  let propName = "filter_" + prop
  let values = pages.map(p => {

    if (p[prop]) { 
	    return p[prop]
    } else {
	    return []}
  })

  let multiValues = []
  for (let v of values) {
  if (v != null) {
    for (let m of v) {
      multiValues.push(m)
    }
  } else {
      multiValues.push(undefined)
    }
  }
  multiValues = [...new Set(multiValues)]
  multiValues.sort()
  multiValues.unshift("-")
  multiValues.unshift("all")


  let valueNames = multiValues.map((v) => {
	  if (v == null) {
	    return "-"
	  } else if (v == "all") {
	    return "-все-"
	  } else {
	    return v
	  }
  })

  let val = await tp.system.suggester(valueNames, multiValues)
  if (!val) {val = "-"}
    await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
		frontmatter[propName] = val
		frontmatter.pagination = 0
	})
  }





const changeFilterTags = async() => {
  let propName = "filter_tags"
  let values = pages.map(p => {

    if (p.file.tags) { 
	    return p.file.tags
    } else {
	    return []}
  })

  let multiValues = []
  for (let v of values) {
  if (v != null) {
    for (let m of v) {
      multiValues.push(m)
    }
  } else {
      multiValues.push(undefined)
    }
  }
  multiValues = [...new Set(multiValues)]
  multiValues.sort()
  multiValues.unshift("-")
  multiValues.unshift("all")


  let valueNames = multiValues.map((v) => {
	  if (v == null) {
	    return "-"
	  } else if (v == "all") {
	    return "-все-"
	  } else {
	    return v
	  }
  })

  let val = await tp.system.suggester(valueNames, multiValues)
  if (!val) {val = "-"}
    await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
		frontmatter.filter_tags = val
		frontmatter.pagination = 0
	})
  }





const filterButton = async(name, prop) => {
  let buttonClass = ""
  let propName = "filter_" + prop
  if (current[propName] != null && current[propName] != "all") {
	  buttonClass = "button-default button-blue"
  }

  createButton({
	app, 
	el: this.container, 
	args: {
		name: name,
		class: buttonClass}, 
	clickOverride: {
		click: await changeFilter, 
		params: [prop]
	}
  })
}


const filterButtonMulti = async(name, prop) => {
  let buttonClass = ""
  let propName = "filter_" + prop
  if (current[propName] != null && current[propName] != "all") {
	  buttonClass = "button-default button-blue"
  }  

  createButton({
	app, 
	el: this.container, 
	args: {
		name: name,
		class: buttonClass}, 
	clickOverride: {
		click: await changeFilterMulti, 
		params: [prop]
	}
  })
}




const filterButtonTags = async(name) => {
  let buttonClass = ""
  if (current.filter_tags != null && current.filter_tags != "all") {
	  buttonClass = "button-default button-blue"
  }  

  createButton({
	app, 
	el: this.container, 
	args: {
		name: name,
		class: buttonClass}, 
	clickOverride: {
		click: await changeFilterTags, 
		params: []
	}
  })
}




const filterFunction = async(prop) => {
  let propName = "filter_" + prop
  let filter = current[propName]
  if (filter == "-") {
    filteredPages = filteredPages.filter(p => p[prop] == undefined)
  } else if (filter != "all" && filter != null) {
	filteredPages = filteredPages.filter(p => p[prop] == filter)
  }
}



const filterFunctionMulti = async(prop) => {
  let propName = "filter_" + prop
  let filter = current[propName]
  if (filter == "-") {
    filteredPages = filteredPages.filter(p => !p[prop] || p[prop].length == 0)
  } else if (filter != "all" && filter != null) {
	filteredPages = filteredPages.filter(p => {
	let propVal = p[prop]
	if (!propVal) {return false} else {
	  return p[prop].includes(filter)
	}
	})
  }
}


const filterFunctionTags = async() => {
  let filter = current.filter_tags
  if (filter == "-") {
    filteredPages = filteredPages.filter(p => p.file.tags.length == 0)
  } else if (filter != "all" && filter != null) {
	filteredPages = filteredPages.filter(p => {
	let propVal = p.file.tags
	if (!propVal) {return false} else {
	  return p.file.tags.includes(filter)
	}
	})
  }
}


const newEntryButton = async(buttonName, fileName, templateName, folderName, open) => {
  let template = tp.file.find_tfile(templateName)
  let folder = app.vault.getAbstractFileByPath(folderName)
  createButton({
	app, 
	el: this.container, 
	args: {
		name: buttonName}, 
	clickOverride: {
		click: await tp.file.create_new, 
		params: [template, fileName, open, folder]
	}
  })
}


const nextPageButton = async(pagesLength, paginationNum) => {
let pagination = current.pagination

if (!pagination) { pagination = 0 }

let remainder = pagesLength % paginationNum
let pagesCount = (pagesLength - remainder) / paginationNum
if (remainder != 0) {
	pagesCount++
} 
  
  let buttonClass = ""
  let increase = true
  if (pagination + 1 >= pagesCount) {
	  buttonClass = "button-default button-gray"
	  increase = false
  }
  createButton({
	app, 
	el: this.container, 
	args: {
		name: ">>",
		class: buttonClass
		}, 
	clickOverride: {
		click: await increasePagination, 
		params: [increase]
	}
  })
}


const prevPageButton = async() => {
  let buttonClass = ""
  let pagination = current.pagination
  if (!pagination) { pagination = 0 }

  if (pagination <= 0) {
	  buttonClass = "button-default button-gray"
  }
  createButton({
	app, 
	el: this.container, 
	args: {
		name: "<<",
		class: buttonClass}, 
	clickOverride: {
		click: await decreasePagination, 
		params: []
	}
  })
}


const increasePagination = async(increase) => {
	let pagination = current.pagination
	if (!pagination) { pagination = 0 }
	if (increase) {
		pagination++
		await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
			frontmatter.pagination = pagination
		})
	}
}

const decreasePagination = async() => {
	let pagination = current.pagination
	if (!pagination) { pagination = 0 }
	if (pagination > 0) {
		pagination--
		await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
			frontmatter.pagination = pagination
		})
	}
}


const joinList = (arr) => {
	let result = ""
	if (arr == null) {
	  return ""
	} else {
		for (let a of arr) {
		    
			result += a + " "
		}
		return result
	}
}


const spanList = (arr) => {
	let result = ""
	if (arr == null) {
	  return ""
	} else {
		for (let a of arr) {
		    
			result += "<span class='dv-tag dv-tag-" + a.replaceAll(" ", "-") + "'>" + a + "</span> "
		}
		return result
	}
}

const spanSingle = (val) => {
	if (val == null) {
		return ""
	} else {
	    return "<span class='dv-tag dv-tag-" + val.replaceAll(" ", "-") + "'>" + val + "</span> "
	}
}


const paginate = (rows, num) => {
	let pagination = current.pagination
	if (!pagination) { pagination = 0 }
	return rows.slice(num * pagination, num * (+pagination + 1))
}



const currentPagination = () => {
	let pagination = current.pagination
	if (!pagination) {pagination = 0}
	dv.span(+pagination + 1)
}


const paginationBlock = async() => {
	await prevPageButton()
    currentPagination()
    await nextPageButton(filteredPages.length, paginationNum)
}


















// Only change the code below

// Select source

let pages = dv.pages('"Test folder"')

let filteredPages = [...pages]


// Select number of entries on the page
let paginationNum = 5


// Apply filters
// Use function filterFunction for non-list properties
// Use function filterFunctionMulti for list properties
// Use function filterFunctionTags for tags (to be able for filter for inline tags along with the tags in properties)

await filterFunctionMulti("status")
await filterFunctionMulti("category")
await filterFunctionTags()


dv.paragraph(" ")


// Add button for creating new note
// Parameters: button name, file name, template name, folder name, open note on creation (boolean)

await newEntryButton("+ Добавить заметку", "Новая заметка", "Информационная заметка", "Test folder", true)


// Add filter buttons
// Use function filterButton for non-list properties
// Use function filterButtonMulti for list properties
// Use function filterButtonTags for tags

await filterButton("#Статус", "status")
await filterButtonMulti("#Категория", "category")
await filterButtonTags("#Тэги")


// Add pagination buttons 
await paginationBlock()


let headers = [ 
	"Название", 
	"Статус",
	"Категория",
	"Тэги"
	]


// Functions joinList, spanList and spanSingle are cosmetical and optional
// Use joinList for tags to show them in one line
// Use spanList for list properties other then tags to show them in one line and to wrap them in spans with specific classes. You can later use css, for example, to make each property different color
// Use spanSingle for non-list properties to wrap them in spans with specific classes

let rows = filteredPages.map(p => [
	p.file.link, 
	spanSingle(p.status),
	spanList(p.category),
	joinList(p.file.tags)
])

rows = paginate(rows, paginationNum)

dv.paragraph(" ")

dv.table(headers, rows)
