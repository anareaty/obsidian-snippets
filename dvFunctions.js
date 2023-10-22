class df {

	createButton(args) {
		app.plugins.plugins["buttons"].createButton(args)
	}



	async changeViewButton(dv, views) {
		let current = dv.current()
		this.createButton({
		  app, 
		  el: dv.container, 
		  args: {
			  name: "▽ " + current.view,
			  class: "button-default button-choice"}, 
		  clickOverride: {
			  click: await this.changeView, 
			  params: [current, views]
		  }
		})	
	}




	async changeView(current, views) {
		const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object
		let currentFile = app.vault.getAbstractFileByPath(current.file.path)
		let values = views

		let val = await tp.system.suggester(values, values)
		if (!val) {val = "Все заметки"}
		app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
			frontmatter.view = val
			frontmatter.pagination = 0
		})
	}









	async filterButton(name, prop, dv, pages) {
		
		let current = dv.current()
		let buttonClass = ""
		let propName = "filter_" + prop
		if (current[propName] != null && current[propName] != "all") {
			buttonClass = "button-default button-blue"
		}
		
		this.createButton({
		  app, 
		  el: dv.container, 
		  args: {
			  name: name,
			  class: buttonClass}, 
		  clickOverride: {
			  click: await this.changeFilter, 
			  params: [prop, current, pages]
		  }
		})	
	}


	async filterButtonLink(name, prop, dv, pages) {
		let current = dv.current()
		let buttonClass = ""
		let propName = "filter_" + prop
		if (current[propName] != null && current[propName] != "all") {
			buttonClass = "button-default button-blue"
		}
		this.createButton({
		  app, 
		  el: dv.container, 
		  args: {
			  name: name,
			  class: buttonClass}, 
		  clickOverride: {
			  click: await this.changeFilterLink, 
			  params: [prop, current, pages]
		  }
		})
	}


	async filterButtonFile(name, prop, dv, pages) {
	let current = dv.current()
	let buttonClass = ""
	let propName = "filter_file_" + prop
	if (current[propName] != null && current[propName] != "all") {
		buttonClass = "button-default button-blue"
	}
	this.createButton({
	  app, 
	  el: dv.container, 
	  args: {
		  name: name,
		  class: buttonClass}, 
	  clickOverride: {
		  click: await this.changeFilterFile, 
		  params: [prop, current, pages]
	  }
	})
	}


	async filterButtonMulti(name, prop, dv, pages) {
	let current = dv.current()
	let buttonClass = ""
	let propName = "filter_" + prop
	if (current[propName] != null && current[propName] != "all") {
		buttonClass = "button-default button-blue"
	}  
	this.createButton({
	  app, 
	  el: dv.container, 
	  args: {
		  name: name,
		  class: buttonClass}, 
	  clickOverride: {
		  click: await this.changeFilterMulti, 
		  params: [prop, current, pages]
	  }
	})
	}
  
  
  	async filterButtonTags(name, dv, pages) {
	let current = dv.current()
	let buttonClass = ""
	if (current.filter_tags != null && current.filter_tags != "all") {
		buttonClass = "button-default button-blue"
	}  
	this.createButton({
	  app, 
	  el: dv.container, 
	  args: {
		  name: name,
		  class: buttonClass}, 
	  clickOverride: {
		  click: await this.changeFilterTags, 
		  params: [current, pages]
	  }
	})
	}


  	async filterButtonBool(name, prop, dv, pages) {
	let current = dv.current()
	let buttonClass = ""
	let propName = "filter_" + prop
	if (current[propName] != null && current[propName] != "all") {
		buttonClass = "button-default button-blue"
	}
	this.createButton({
	  app, 
	  el: dv.container, 
	  args: {
		  name: name,
		  class: buttonClass}, 
	  clickOverride: {
		  click: await this.changeFilterBool, 
		  params: [prop, current, pages]
	  }
	})
  	}

	

	
	async changeFilter(prop, current, pages) {
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
  
	async changeFilterLink(prop, current, pages) {
		const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object
		let currentFile = app.vault.getAbstractFileByPath(current.file.path)
		let propName = "filter_" + prop
		let values = pages.map(p => p[prop])
		
	
		values = values.map(v => {
			if (v && v.path) {
				return v.path
			} else return false
		})
	
		values = [...new Set(values)]
	
		values = values.filter(v => v)
		values.sort()
		values.unshift("-")
		values.unshift("all")
		let valueNames = values.map((v) => {
			if (v == "all") {
			  return "-все-"
			} else {
			  return v.replace(/(.*)(\/)([^\/]+)(\.md)/, "$3")
			}
		})
	
	
	
		let val = await tp.system.suggester(valueNames, values)
		if (!val) {val = "-"}
		app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
			frontmatter[propName] = val
			frontmatter.pagination = 0
		})
	}
	
	async changeFilterFile(prop, current, pages) {
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
	
	async changeFilterMulti(prop, current, pages) {
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
			  return "-все-"
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
	
	async changeFilterTags(current, pages) {
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
			  return "-все-"
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
	
	async changeFilterBool(prop, current, pages) {
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
			  return "-все-"
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
	  



	async filterFunction(prop, current, filteredPages) {
		let propName = "filter_" + prop
		let filter = current[propName]
		if (filter == "-") {
		  return filteredPages.filter(p => !p[prop])
		} else if (filter != "all" && filter != null) {
		  return filteredPages.filter(p => p[prop] == filter)
		} else return filteredPages
	}


	async filterFunction(prop, current, filteredPages) {
	
	let propName = "filter_" + prop
	let filter = current[propName]
	if (filter == "-") {
	  return filteredPages.filter(p => !p[prop])
	} else if (filter != "all" && filter != null) {
	  return filteredPages.filter(p => p[prop] == filter)
	} else return filteredPages
	}


	async filterFunctionLink(prop, current, filteredPages) {
	
	let propName = "filter_" + prop
	let filter = current[propName]
	if (filter == "-") {
	  return filteredPages.filter(p => !p[prop])
	} else if (filter != "all" && filter != null) {
	  return filteredPages.filter(p => p[prop] && p[prop].path == filter)
	} else return filteredPages
	}


	async filterFunctionFile(prop, current, filteredPages) {
	let propName = "filter_file_" + prop
	let filter = current[propName]
	if (filter == "-") {
	  return filteredPages.filter(p => !p.file[prop])
	} else if (filter != "all" && filter != null) {
	  return filteredPages.filter(p => p.file[prop] == filter)
	} else return filteredPages
	}


	async filterFunctionMulti(prop, current, filteredPages) {
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
  
  
  	async filterFunctionTags(current, filteredPages) {
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


  	async filterFunctionBool(prop, current, filteredPages) {
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




  	async newEntryButton(buttonName, fileName, templateName, folderName, open, dv) {
	const tp = app.plugins.plugins["templater-obsidian"].templater.current_functions_object
	let template = tp.file.find_tfile(templateName)
	let folder = app.vault.getAbstractFileByPath(folderName)
	this.createButton({
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



	
  	async increasePagination(increase, current) {
		
	let currentFile = app.vault.getAbstractFileByPath(current.file.path)
	let pagination = current.pagination
	console.log(current)
	if (!pagination) { pagination = 0 }
	if (increase) {
		pagination++
		console.log(pagination)
		await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
			frontmatter.pagination = pagination
		})
	}
	}


	async decreasePagination(current) {
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


	async nextPageButton(pagesCount, dv) {
	let current = dv.current()
	let pagination = current.pagination
	if (!pagination) { pagination = 0 }
	  
	  let buttonClass = ""
	  let increase = true
	  if (pagination + 1 >= pagesCount) {
		  buttonClass = "button-default button-gray"
		  increase = false
	  }
	  this.createButton({
		app, 
		el: dv.container, 
		args: {
			name: ">>",
			class: buttonClass
			}, 
		clickOverride: {
			click: await this.increasePagination, 
			params: [increase, current]
		}
	  })
	}
	
	
	async prevPageButton(dv) {
	  let current = dv.current()
	  let buttonClass = ""
	  let pagination = current.pagination
	  if (!pagination) { pagination = 0 }
	
	  if (pagination <= 0) {
		  buttonClass = "button-default button-gray"
	  }
	  this.createButton({
		app, 
		el: dv.container, 
		args: {
			name: "<<",
			class: buttonClass}, 
		clickOverride: {
			click: await this.decreasePagination, 
			params: [current]
		}
	  })
	}


	currentPagination(dv) {
		let pagination = dv.current().pagination
		if (!pagination) {pagination = 0}
		return +pagination + 1
	}
	

	async paginationBlock(filteredPages, paginationNum, dv) {
		let pagesLength = filteredPages.length
		let remainder = pagesLength % paginationNum
		let pagesCount = (pagesLength - remainder) / paginationNum
		if (remainder != 0) {
			pagesCount++
		} 

		await this.prevPageButton(dv)
		dv.span(this.currentPagination(dv))
		await this.nextPageButton(pagesCount, dv)
		dv.span(pagesCount)
	}


	paginate(rows, num, current) {
		let pagination = current.pagination
		if (!pagination) { pagination = 0 }
		return rows.slice(num * pagination, num * (+pagination + 1))
	}







	joinTags(arr) {
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
	



	spanList(arr) {
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




	
	spanSingle(val) {
		if (val == null) {
			return ""
		} else {
			return "<span class='dv-tag dv-tag-" + val.replaceAll(" ", "-") + "'>" + val + "</span> "
		}
	}
	
	
	
	
	createLink(name, source) {
		if (source) {
			return "[" + name + "](" + source + ")"
		} else return "\\-"
	}
	

	
	renderBoolean(p, prop) {
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



	taskProgress(p) {
		let tasks = p.file.tasks
		let completed = tasks.filter(t => t.completed == true)
		let max = tasks.length
		let value = completed.length
		if (max > 0) {
			return "<progress max=" + max + " value=" + value + "></progress>"
		} else return ""
	}



	propProgress(value, max) {
		if (max) {
			if (!value) value = 0
			return "<progress max=" + max + " value=" + value + "></progress><span style='font-size: var(--font-ui-smaller)'> " + Math.round(value * 100 / max) + " % </span>"
		} else return ""
	}




	async togglePropButton(label, prop, dv) {
		let current = dv.current()
		let currentFile = app.vault.getAbstractFileByPath(current.file.path)

		let checkbox = document.createElement("input")
		checkbox.type = "checkbox"
		checkbox.style = "vertical-align: middle"
		checkbox.checked = current[prop]
		checkbox.onchange = async() => {
			await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
				frontmatter[prop] = !current[prop]
			})
		}
		dv.span(checkbox)
		dv.span(label)
		
    }


	getImagePath(name) {
		let basePath = app.vault.adapter.basePath
		if (!basePath) return null
		let files = app.vault.getFiles()
		let file = files.find(f => f.name == name)
		if (file) {
			return basePath + "/" + file.path
		} else return ""
		
	  }



	  async createLinkButton(args) {
		let {dv, name, className, params} = args
		let file = app.vault.getAbstractFileByPath(...params)
		let button = document.createElement("button")
		button.append(name)
		button.className = className
		button.onclick = async () => {app.workspace.activeLeaf.openFile(file)}
		return dv.span(button)
	  }



	async getCanvasPages(dv) {
		let canvases = await app.vault.getFiles().filter(f => f["extension"] == "canvas")
		let canvasPages = canvases.map(c => {
			c.folder = c.parent.path
			c.ext = c.extension
			c.name = c.basename
			c.link = "[[" + c.folder + "/" + c.name + ".canvas|" + c.name + "]]"
			return {file: c, type: "canvas"}
		})

		return dv.array(canvasPages)
	}

}

