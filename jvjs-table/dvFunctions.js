const {createButton} = app.plugins.plugins["buttons"]



const filterButton = async(name, prop, dv, pages) => {
	let current = dv.current()
	let buttonClass = ""
	let propName = "filter_" + prop
	if (current[propName] != null && current[propName] != "all") {
		buttonClass = "button-default button-blue"
	}
	createButton({
	  app, 
	  el: dv.container, 
	  args: {
		  name: name,
		  class: buttonClass}, 
	  clickOverride: {
		  click: await changeFilter, 
		  params: [prop, current, pages]
	  }
	})
}


const filterButtonFile = async(name, prop, dv, pages) => {
	let current = dv.current()
	let buttonClass = ""
	let propName = "filter_file_" + prop
	if (current[propName] != null && current[propName] != "all") {
		buttonClass = "button-default button-blue"
	}
	createButton({
	  app, 
	  el: dv.container, 
	  args: {
		  name: name,
		  class: buttonClass}, 
	  clickOverride: {
		  click: await changeFilterFile, 
		  params: [prop, current, pages]
	  }
	})
}


  
  const filterButtonMulti = async(name, prop, dv, pages) => {
	let current = dv.current()
	let buttonClass = ""
	let propName = "filter_" + prop
	if (current[propName] != null && current[propName] != "all") {
		buttonClass = "button-default button-blue"
	}  
	createButton({
	  app, 
	  el: dv.container, 
	  args: {
		  name: name,
		  class: buttonClass}, 
	  clickOverride: {
		  click: await changeFilterMulti, 
		  params: [prop, current, pages]
	  }
	})
  }
  
  
  
  const filterButtonTags = async(name, dv, pages) => {
	let current = dv.current()
	let buttonClass = ""
	if (current.filter_tags != null && current.filter_tags != "all") {
		buttonClass = "button-default button-blue"
	}  
	createButton({
	  app, 
	  el: dv.container, 
	  args: {
		  name: name,
		  class: buttonClass}, 
	  clickOverride: {
		  click: await changeFilterTags, 
		  params: [current, pages]
	  }
	})
  }



  const filterButtonBool = async(name, prop, dv, pages) => {
	let current = dv.current()
	let buttonClass = ""
	let propName = "filter_" + prop
	if (current[propName] != null && current[propName] != "all") {
		buttonClass = "button-default button-blue"
	}
	createButton({
	  app, 
	  el: dv.container, 
	  args: {
		  name: name,
		  class: buttonClass}, 
	  clickOverride: {
		  click: await changeFilterBool, 
		  params: [prop, current, pages]
	  }
	})
  }




const changeFilter = async(prop, current, pages) => {
	const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object
	let currentFile = app.vault.getAbstractFileByPath(current.file.path)
	let propName = "filter_" + prop
	let values = pages.map(p => p[prop])
	values = [...new Set(values)]

	values = values.filter(v => v)
	values.sort()
	values.unshift("-")
	values.unshift("all")
	let valueNames = values.map((v) => {
		if (v == "all") {
		  return "-all-"
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



const changeFilterFile = async(prop, current, pages) => {
	const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object
	let currentFile = app.vault.getAbstractFileByPath(current.file.path)
	let propName = "filter_file_" + prop
	let values = pages.map(p => p.file[prop])
	values = [...new Set(values)]
	values = values.filter(v => v)
	values.sort()
	values.unshift("-")
	values.unshift("all")
	let valueNames = values.map((v) => {
		if (v == "all") {
		  return "-all-"
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




const changeFilterMulti = async(prop, current, pages) => {
	const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object
	let currentFile = app.vault.getAbstractFileByPath(current.file.path)
	let propName = "filter_" + prop
	let values = pages.map(p => {
  
	  if (p[prop]) { 
		  return p[prop]
	  } else {
		  return []}
	})

	
	let multiValues = []
	for (let v of values) {
	  if (v) {
	    for (let m of v) {
		  multiValues.push(m)
	    }
	  } 
	}

	multiValues = [...new Set(multiValues)]

	multiValues = multiValues.filter(v => v)

	multiValues.sort()
	multiValues.unshift("-")
	multiValues.unshift("all")
	let valueNames = multiValues.map((v) => {
		if (v == "all") {
		  return "-all-"
		} else {
		  return v
		}
	})
	let val = await tp.system.suggester(valueNames, multiValues)
	  await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
		frontmatter[propName] = val
		frontmatter.pagination = 0
	})
}





const changeFilterTags = async(current, pages) => {
	const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object
	let currentFile = app.vault.getAbstractFileByPath(current.file.path)
	let propName = "filter_tags"
	let values = pages.map(p => {
  
	  if (p.file.tags) { 
		  return p.file.tags
	  } else {
		  return []}
	})
	let multiValues = []
	for (let v of values) {
	if (v) {
	  for (let m of v) {
		multiValues.push(m)
	  }
	} 
	}
	multiValues = [...new Set(multiValues)]
	multiValues = multiValues.filter(v => v)
	multiValues.sort()
	multiValues.unshift("-")
	multiValues.unshift("all")
	let valueNames = multiValues.map((v) => {
		if (v == "all") {
		  return "-all-"
		} else {
		  return v
		}
	})
	let val = await tp.system.suggester(valueNames, multiValues)
	await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
		frontmatter.filter_tags = val
		frontmatter.pagination = 0
	})
}



const changeFilterBool = async(prop, current, pages) => {
	const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object
	let currentFile = app.vault.getAbstractFileByPath(current.file.path)
	let propName = "filter_" + prop
	let values = pages.map(p => p[prop]).map(v => {
		if (v === undefined) return "-"
		else if (v === false || v === null) return false
		else return v
	})
	values = [...new Set(values)]
	values.sort()
	values.unshift("all")
	let valueNames = values.map((v) => {
		if (!v) {
		  return "false"
		} else if (v == "all") {
		  return "-all-"
		} else {
		  return v
		}
	})
	let val = await tp.system.suggester(valueNames, values)
	if (!val) {val = false}
	  app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
		frontmatter[propName] = val
		frontmatter.pagination = 0
	})
}
  




const filterFunction = async(prop, current, filteredPages) => {
	let propName = "filter_" + prop
	let filter = current[propName]
	if (filter == "-") {
	  return filteredPages.filter(p => !p[prop])
	} else if (filter != "all" && filter != null) {
	  return filteredPages.filter(p => p[prop] == filter)
	} else return filteredPages
}


const filterFunctionFile = async(prop, current, filteredPages) => {
	let propName = "filter_file_" + prop
	let filter = current[propName]
	if (filter == "-") {
	  return filteredPages.filter(p => !p.file[prop])
	} else if (filter != "all" && filter != null) {
	  return filteredPages.filter(p => p.file[prop] == filter)
	} else return filteredPages
}




const filterFunctionMulti = async(prop, current, filteredPages) => {
	let propName = "filter_" + prop
	let filter = current[propName]
	if (filter == "-") {
	  return filteredPages.filter(p => !p[prop] || p[prop].length == 0)
	} else if (filter != "all" && filter != null) {
	  return filteredPages.filter(p => {
	  	let propVal = p[prop]
	  	if (!propVal) {return false} else {
			return p[prop].includes(filter)
	  	}
	  })
    } else return filteredPages
}
  
  
  const filterFunctionTags = async(current, filteredPages) => {
	let filter = current.filter_tags
	if (filter == "-") {
	  return filteredPages.filter(p => !p.file.tags || p.file.tags.length == 0)
	} else if (filter != "all" && filter != null) {
	  return filteredPages.filter(p => {
	  	let propVal = p.file.tags
	  	if (!propVal) {return false} else {
			return p.file.tags.includes(filter)
	  	}
	  })
	} else return filteredPages
  }



  const filterFunctionBool = async(prop, current, filteredPages) => {
	let propName = "filter_" + prop
	let filter = current[propName]
	if (filter == "-") {
	  return filteredPages.filter(p => p[prop] === undefined)
	} else if (filter === false) {
		return filteredPages.filter(p => p[prop] === false || p[prop] === null)	
 	} else if (filter != "all" && filter != null) {
	  return filteredPages.filter(p => p[prop] == filter)
	} else return filteredPages
}




  const newEntryButton = async(buttonName, fileName, templateName, folderName, open, dv) => {
	const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object
	let template = tp.file.find_tfile(templateName)
	let folder = app.vault.getAbstractFileByPath(folderName)
	createButton({
	  app, 
	  el: dv.container, 
	  args: {
		  name: buttonName}, 
	  clickOverride: {
		  click: await tp.file.create_new, 
		  params: [template, fileName, open, folder]
	  }
	})
  }



	
  const increasePagination = async(increase, current) => {
	let currentFile = app.vault.getAbstractFileByPath(current.file.path)
	let pagination = current.pagination
	if (!pagination) { pagination = 0 }
	if (increase) {
		pagination++
		await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
			frontmatter.pagination = pagination
		})
	}
}

const decreasePagination = async(current) => {
	let currentFile = app.vault.getAbstractFileByPath(current.file.path)
	let pagination = current.pagination
	if (!pagination) { pagination = 0 }
	if (pagination > 0) {
		pagination--
		await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
			frontmatter.pagination = pagination
		})
	}
}



  const nextPageButton = async(pagesCount, dv) => {
	let current = dv.current()
	let pagination = current.pagination
	if (!pagination) { pagination = 0 }
	  
	  let buttonClass = ""
	  let increase = true
	  if (pagination + 1 >= pagesCount) {
		  buttonClass = "button-default button-gray"
		  increase = false
	  }
	  createButton({
		app, 
		el: dv.container, 
		args: {
			name: ">>",
			class: buttonClass
			}, 
		clickOverride: {
			click: await increasePagination, 
			params: [increase, current]
		}
	  })
	}
	
	
	const prevPageButton = async(dv) => {
	  let current = dv.current()
	  let buttonClass = ""
	  let pagination = current.pagination
	  if (!pagination) { pagination = 0 }
	
	  if (pagination <= 0) {
		  buttonClass = "button-default button-gray"
	  }
	  createButton({
		app, 
		el: dv.container, 
		args: {
			name: "<<",
			class: buttonClass}, 
		clickOverride: {
			click: await decreasePagination, 
			params: [current]
		}
	  })
	}

	const currentPagination = (dv) => {
		let pagination = dv.current().pagination
		if (!pagination) {pagination = 0}
		return +pagination + 1
	}
	



	const paginationBlock = async(filteredPages, paginationNum, dv) => {
		let pagesLength = filteredPages.length
		let remainder = pagesLength % paginationNum
		let pagesCount = (pagesLength - remainder) / paginationNum
		if (remainder != 0) {
			pagesCount++
		} 

		await prevPageButton(dv)
		dv.span(currentPagination(dv))
		await nextPageButton(pagesCount, dv)
		dv.span(pagesCount)
	}



	const paginate = async(rows, num, current) => {
		let pagination = current.pagination
		if (!pagination) { pagination = 0 }
		return rows.slice(num * pagination, num * (+pagination + 1))
	}



	const joinTags = (arr) => {
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
	
	
	
	const createLink = (name, source) => {
		if (source) {
			return "[" + name + "](" + source + ")"
		} else return "\\-"
	}
	

	
	const renderBoolean = (p, prop) => {
		if (p[prop] !== true) {
			p[prop] = false
		}
	
		let checkbox = document.createElement("input")
		checkbox.type = "checkbox"
		checkbox.checked = p[prop]
		checkbox.onchange = async() => {
			let file = app.vault.getAbstractFileByPath(p.file.path)
			await app.fileManager.processFrontMatter(file, (frontmatter) => { 
				frontmatter[prop] = !p[prop]
			})
		}
		return checkbox
	}



	const taskProgress = (p) => {
		let tasks = p.file.tasks
		let completed = tasks.filter(t => t.completed == true)
		let max = tasks.length
		let value = completed.length
		return "<progress max=" + max + " value=" + value + "></progress>"
	}







exports.filterButton = filterButton;
exports.filterButtonFile = filterButtonFile;
exports.filterButtonMulti = filterButtonMulti;
exports.filterButtonTags = filterButtonTags;
exports.filterButtonBool = filterButtonBool;

exports.filterFunction = filterFunction;
exports.filterFunctionFile = filterFunctionFile;
exports.filterFunctionMulti = filterFunctionMulti;
exports.filterFunctionTags = filterFunctionTags;
exports.filterFunctionBool = filterFunctionBool;


exports.newEntryButton = newEntryButton;

exports.paginationBlock = paginationBlock;

exports.paginate = paginate;

exports.joinTags = joinTags;
exports.spanList = spanList;
exports.spanSingle = spanSingle;
exports.createLink = createLink;
exports.renderBoolean = renderBoolean;

exports.taskProgress = taskProgress;
