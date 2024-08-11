class dvIT {

async suggester(values, names) {

    const {SuggestModal, setIcon} = customJS.obsidian
    let data = new Promise((resolve, reject) => {
  
        this.MySuggestModal = class extends SuggestModal {

            getSuggestions(query) {
                return values.filter((val) => {
                    if (val.startsWith("[[")) {
                        val = val.replace(/(.*)(\/)([^\/]+)(\]\])(.*)/, "$3$5").replace(/(\[\[)(.*)(\]\])(.*)/, "$2$4")
                    }
                    return val.toLowerCase().includes(query.toLowerCase())
                });
            }
            renderSuggestion(val, el) {
                let text = val
                if (names) {
                    text = names[values.indexOf(val)]
                } 
                if (text.startsWith("[[")) {
                    text = text.replace(/(.*)(\/)([^\/]+)(\]\])(.*)/, "$3$5")
                        .replace(/(\[\[)(.*)(\]\])(.*)/, "$2$4")
                    let iconWrapper = el.createEl("span", { cls: "inline-icon" })
                    let textEl = el.createEl("span", {text: text})
                    setIcon(iconWrapper, "link")
                } else {
                    el.createEl("div", {text: text})
                }
            }
            onChooseSuggestion(val, event) {
                resolve(val)
            } 
        }
        new this.MySuggestModal(app).open()  
    })
    return data


    
}


async fuzzySuggester(values, names) {
    const {FuzzySuggestModal, setIcon} = customJS.obsidian
    let data = new Promise((resolve, reject) => {
        this.MyFuzzySuggestModal = class extends FuzzySuggestModal {
            getItems() {
                return values
            }
            getItemText(val) {
                let text = val
                if (names) {
                    text = names[values.indexOf(val)]
                }
                if (text.startsWith("[[")) {
                    text = text.replace(/(.*)(\/)([^\/]+)(\]\])(.*)/, "$3$5").replace(/(\[\[)(.*)(\]\])(.*)/, "$2$4")
                }
                return text
            }
            renderSuggestion(val, el) {
                let text = val.item
                if (names) {
                    text = names[values.indexOf(text)]
                }
                if (text.startsWith("[[")) {
                    text = text.replace(/(.*)(\/)([^\/]+)(\]\])(.*)/, "$3$5").replace(/(\[\[)(.*)(\]\])(.*)/, "$2$4")
                    let iconWrapper = el.createEl("span", { cls: "inline-icon" })
                    let textEl = el.createEl("span", {text: text})
                    setIcon(iconWrapper, "link")
                } else {
                    el.createEl("div", {text: text})
                } 
            }
            onChooseItem(val, event) {
                resolve(val)
            }   
        }
        new this.MyFuzzySuggestModal(app).open()  
    })
    return data
}


async multiSuggestDouble(header, names, values, existingValues) {
    const {Modal, Setting} = customJS.obsidian
    let data = new Promise((resolve, reject) => {

        this.MyPromptModal = class extends Modal {
            constructor(app) {
                super(app);
            }
            onOpen() {
                const {contentEl} = this
                contentEl.createEl("h1", {text: header})
                let include = existingValues.include
                if (!include) include = []
                let exclude = existingValues.exclude
                if (!exclude) exclude = []
                let allValues = existingValues.allValues
                if (!allValues) allValues = false
                this.result = {include, exclude, allValues}
                new Setting(contentEl)
                .setName("Result fits all values")
                .addToggle((toggle) => {
                    toggle.setValue(this.result.allValues)
                    toggle.onChange((toggleValue) => {
                        this.result.allValues = toggleValue
                    })
                })
                new Setting(contentEl).addButton((btn) => btn
                .setButtonText("Clear all")
                .onClick(() => {
                    let toggles = document.querySelectorAll(".select-line .filter-checkbox.is-enabled")
                    for (let toggle of toggles) {
                        toggle.click()
                    }
                }))
                for (let val of values) {
                    let index = values.indexOf(val)
                    let lineClass = "select-line-" + index
                    let name = names[index]
                    new Setting(contentEl)
                    .setName(name)
                    .setClass(lineClass)
                    .setClass("select-line")
                    .addToggle((toggle) => {
                        if (existingValues.include.find(a => a == val)) {
                            toggle.setValue(true)
                        }
                        toggle.onChange((toggleValue) => {
                            include = include.filter(a => a != val)
                            if (toggleValue) {
                                include.push(val)
                            }
                            this.result.include = include
                            let excludeOn = document.querySelector("." + lineClass + " .filter-checkbox:nth-child(2).is-enabled")
                            if (toggleValue && excludeOn) {
                                excludeOn.click()
                            }     
                        })
                    })
                    .addToggle((toggle) => {	
                        if (existingValues.exclude.find(a => a == val)) {
                            toggle.setValue(true)
                        }
                        toggle.onChange((toggleValue) => {
                            exclude = exclude.filter(a => a != val)
                            if (toggleValue) {
                                exclude.push(val)
                            }
                            this.result.exclude = exclude
                            let includeOn = document.querySelector("." + lineClass + " .filter-checkbox:nth-child(1).is-enabled")
                            if (toggleValue && includeOn) {
                                includeOn.click()
                            }
                        })
                    })
                    let includeCheckbox = document.querySelector("." + lineClass + " .checkbox-container:nth-child(1)")
                    includeCheckbox.classList.add("include")
                    includeCheckbox.classList.add("filter-checkbox")
                    let excludeCheckbox = document.querySelector("." + lineClass + " .checkbox-container:nth-child(2)")
                    excludeCheckbox.classList.add("exclude")
                    excludeCheckbox.classList.add("filter-checkbox")
                }
                new Setting(contentEl).addButton((btn) => btn
                .setButtonText("Submit")
                .setCta()
                .onClick(() => {
                    resolve(this.result)
                    this.close()              
                }))
            }
            onClose() {
                const {contentEl} = this
                contentEl.empty()
                if (this.result) {
                    resolve(this.result)
                }
                reject("Task not submitted")
            } 
        }
        new this.MyPromptModal(app).open()  
    }).catch((e) => {console.log(e)})
    return data
}


async textInput(name, defaultVal) {
    if (!defaultVal) {defaultVal = ""}
    const {Modal, Setting} = customJS.obsidian
    let data = new Promise((resolve, reject) => {
        this.MyTextInputModal = class extends Modal {
            constructor(app) {
                super(app);
                this.eventInput = this.eventInput.bind(this)
            }
            eventInput(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    resolve(this.result)
                    this.close()
                }
            }
            onOpen() {
                const {contentEl} = this
                contentEl.createEl("h1", {text: name})
                const inputSetting = new Setting(contentEl)
                inputSetting.settingEl.style.display = "grid";
                inputSetting.addTextArea((text) => {
                    text.setValue(defaultVal)
                    this.result = defaultVal
                    text.onChange((value) => {
                       this.result = value
                    })
                    text.inputEl.style.width = "100%";
                    text.inputEl.rows = 10
                })
                new Setting(contentEl).addButton((btn) => btn
                .setButtonText("Сохранить")
                .setCta()
                .onClick(() => {
                    resolve(this.result)
                    this.close()
                }))
                contentEl.addEventListener("keydown", this.eventInput)
            }
            onClose() {
                const {contentEl} = this
                contentEl.empty()
                this.contentEl.removeEventListener("keydown", this.eventInput)
                reject("Not submitted") 
            } 
        }
        new this.MyTextInputModal(app).open()  
    }).catch((e) => {console.log(e)})
    return data
}


async numberInput(name, defaultVal) {

    if (!defaultVal && defaultVal !== 0) {defaultVal = ""}
    const {Modal, Setting} = customJS.obsidian
    let data = new Promise((resolve, reject) => {

        this.MyNumberInputModal = class extends Modal {
            constructor(app) {
                super(app);
                this.eventInput = this.eventInput.bind(this)
            }
            eventInput(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    resolve(this.result)
                    this.close()
                }
            }
            onOpen() {
                const {contentEl} = this
                contentEl.createEl("h1", {text: name})
                const inputSetting = new Setting(contentEl)
                inputSetting.settingEl.style.display = "grid";
                inputSetting.addButton((btn) => btn
                .setButtonText("-")
                .setCta()
                .onClick(() => {
                    this.result = Number(this.result - 1)
                    let inputEl = contentEl.querySelector(".number-input-el")
                    inputEl.value = this.result + ""
                }))
                inputSetting.addText((text) => {
                    text.inputEl.type = "number"
                    text.inputEl.className = "number-input-el"
                    text.setValue(defaultVal + "")
                    this.result = defaultVal
                    text.onChange((value) => {
                       if (value && value != "") {
                        value = Number(value)
                       }
                       if (value == NaN) {
                        value = null
                       }
                       this.result = value
                       
                    })
                    text.inputEl.style.width = "100%";
                })
                inputSetting.addButton((btn) => btn
                .setButtonText("+")
                .setCta()
                .onClick(() => {
                    this.result = Number(this.result) + 1
                    let inputEl = contentEl.querySelector(".number-input-el")
                    inputEl.value = this.result + ""
                }))
                new Setting(contentEl).addButton((btn) => btn
                .setButtonText("Сохранить")
                .setCta()
                .onClick(() => {
                    resolve(this.result)
                    this.close()
                }))
                contentEl.addEventListener("keydown", this.eventInput)
            }
            onClose() {
                const {contentEl} = this
                contentEl.empty()
                this.contentEl.removeEventListener("keydown", this.eventInput)
                reject("Not submitted") 
            } 
        }
        new this.MyNumberInputModal(app).open()  
    }).catch((e) => {console.log(e)})
    return data
}



async dateInput(name, defaultVal) {
    if (!defaultVal) {defaultVal = ""}
    const {Modal, Setting} = customJS.obsidian
    let data = new Promise((resolve, reject) => {
        this.MyTextInputModal = class extends Modal {
            constructor(app) {
                super(app);
                this.eventInput = this.eventInput.bind(this)
            }
            eventInput(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    resolve(this.result)
                    this.close()
                }
            }
            onOpen() {
                const {contentEl} = this
                contentEl.classList.add("date-input-modal")
                contentEl.createEl("h1", {text: name})
                const inputSetting = new Setting(contentEl)
                inputSetting.settingEl.style.display = "grid";
                inputSetting.addText((text) => {
                    text.setValue(defaultVal)
                    this.result = defaultVal
                    text.onChange((value) => {
                       this.result = value
                    })
                    text.inputEl.style.width = "100%";
                    text.inputEl.type = "date"
                })
                new Setting(contentEl).addButton((btn) => btn
                .setButtonText("Сохранить")
                .setCta()
                .onClick(() => {
                    resolve(this.result)
                    this.close()
                }))
                contentEl.addEventListener("keydown", this.eventInput)
            }
            onClose() {
                const {contentEl} = this
                contentEl.empty()
                this.contentEl.removeEventListener("keydown", this.eventInput)
                reject("Not submitted") 
            } 
        }
        new this.MyTextInputModal(app).open()  
    }).catch((e) => {console.log(e)})
    return data
}









// Check if inside link


isLink(prop) {
    if (prop && prop.path) {
        return true
    } else return false
}



// Check if url string

isUrl(prop) {
    if (prop && typeof prop == "string" && prop.startsWith("http")) {
        return true
    } else return false
}


// Fix for wrong properties, where it is text instead of list
fixList(prop) {
    if (prop && !Array.isArray(prop)) {
        prop = [prop]
    }
    return prop
}





getPropType(prop) {
    let propTypes = app.metadataTypeManager.properties
    //let type = "no filter"
    let type
    prop = prop.toLowerCase()
    if (propTypes[prop] && propTypes[prop].type) {
        type = propTypes[prop].type
    }

    if (prop.startsWith("file.")) type = "no filter"

    if (prop == "file.path" ||
      prop == "file.name" ||
      prop == "file.link" ||
      prop == "file.folder" ||
      prop == "file.ext") {
        type = "text"
    } else if (prop == "file.outlinks" ||
      prop == "file.inlinks" ||
      prop == "file.etags" ||
      prop == "file.tags" ||
      prop == "file.aliases" ||
      prop == "tags" ||
      prop == "aliases") {
        type = "multitext"
    } else if (prop == "file.cday" ||
      prop == "file.mday") {
        type = "date"
    } else if (prop == "file.ctime" ||
      prop == "file.mtime") {
        type = "datetime"
    } else if (prop == "file.starred") {
      type = "checkbox"
    } else if (prop == "taskProgress" || prop == "slider") {
      type = "no prop"
    }

    if (!type) type = "text"


    return type
} 








/* FILTER FUNCTIONS */

// Change view	









    async changeViewButton(dv) {
        let currentView = dv.current().view

        if (!currentView) {
            currentView = "table"
        }

        let icon = "table-2"

        if (currentView == "list") {
            icon = "list"
        }

        if (currentView == "cards") {
            icon = "layout-grid"
        }

        


        let button = document.createElement("button")
        let iconWrapper = document.createElement("span")
        iconWrapper.className = "change-view-button-icon"
        obsidian.setIcon(iconWrapper, icon)
        button.append(iconWrapper)
    
        button.className = "dvit-button change-view-button"
        button.onclick = async () => {
            await this.changeView(dv)    
        }
        dv.container.append(button)
	}


    async changeView(dv) {
    
        let currentFile = await app.vault.getAbstractFileByPath(dv.current().file.path)

        let currentView = dv.current().view
        let views = ["table", "cards", "list"]
        let view = await this.suggester(views)
        
        if (view && view != currentView) {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                frontmatter.view = view
            })
        }

        setTimeout(async() => {
	        await app.commands.executeCommandById("dataview:dataview-force-refresh-views")
	    }, 250)
	}

















// Filter


async filterProps(props, current, pages) {
    props = props.filter(prop => prop.type != "no prop")

	for (let p of props) {
        pages = await this.filter(p, current, pages)
	}
	return pages
}




async filter(p, current, filteredPages) {
    const dv = this.dv
    const getVal = this.getVal
    let { prop, multiSelect } = p

    let {isLink, containsPath, listContainsPath, fixList, getPropType} = this

    let propType = getPropType(prop)


	let propName = "filter_" + prop
	let filter = current[propName]
	
	


    


	if (propType == "text" || propType == "number") {
		if (filter == "-") {
		  return filteredPages.filter(p => !getVal(p, prop))
    } else if (isLink(filter)) {
          return filteredPages.filter(p => containsPath(getVal(p, prop), filter.path))
    } else if (filter && filter != "all") {
        if (prop == "file.folder") {
            return filteredPages.filter(p => getVal(p, prop).startsWith(filter))
        } else return filteredPages.filter(p => getVal(p, prop) == filter)
    } else {
          return filteredPages 
    }
	}



    else if (propType == "multitext") {

        if (multiSelect) {

            let includePropName = "filter_include_" + prop
            let excludePropName = "filter_exclude_" + prop
            let allValuesPropName = "filter_all_values_" + prop

            let includeFilter = current[includePropName]
            let excludeFilter = current[excludePropName]
            let allValues = current[allValuesPropName]

            if (!includeFilter) {
                includeFilter = []
            } 

            if (!excludeFilter) {
                excludeFilter = []
            } 

            if (allValues) {
                
                for (let f of includeFilter) {

                    if (f == "-") {
                        filteredPages = filteredPages.filter(p => !getVal(p, prop) || getVal(p, prop).length == 0)

                    } else if (isLink(f)) {
                        filteredPages = filteredPages.filter(p => {
                            val = fixList(getVal(p, prop))

                            



                            return listContainsPath (val, f.path)
                        })

                    } else if (f) {
                        filteredPages = filteredPages.filter(p => {
                            let val = getVal(p, prop)
                            if (!val) {return false} else {
                            return val.includes(f)
                            }
                        })
                    } 
                }

                for (let f of excludeFilter) {

                    if (f == "-") {
                        filteredPages = filteredPages.filter(p => getVal(p, prop) && getVal(p, prop).length != 0)

                    } else if (isLink(f)) {
                        filteredPages = filteredPages.filter(p => {
                            let val = fixList(getVal(p, prop))
                            return !val || !val.find(link => link.path == f.path)
                        })

                    } else if (f) {
                        filteredPages = filteredPages.filter(p => {
                            let val = getVal(p, prop)
                            if (!val) {return true} else {
                            return !val.includes(f)
                            }
                        })
                    } 
                }
            } else {
                if (includeFilter.length > 0) {

                    filteredPages = filteredPages.map(p => {
                        let val = getVal(p, prop)
                        for (let f of includeFilter) {
                            if (f == "-" && (!val || val.length == 0)) {
                                return p
                            } else if (f && f.path && (val && val.find(link => link.path == f.path))){
                                return p
                            } else if (f && val && val.includes(f)) {
                                return p
                            }
                        }
                        return false   
                    })
                    filteredPages = filteredPages.filter(p => p)  
                }


                if (excludeFilter.length > 0) {

                    filteredPages = filteredPages.map(p => {
                        let val = getVal(p, prop)
                        for (let f of excludeFilter) {
                            if (f == "-" && (!val || val.length == 0)) {
                                return p
                            } else if (f.path && (!val || !val.find(link => link.path == f.path))){
                                return p
                            } else if (!val || !val.includes(f)) {
                                return p
                            }
                        }
                        return false   
                    })
                    filteredPages = filteredPages.filter(p => p)  
                }
            }
            return filteredPages



        } else {

            if (filter == "-") {
                filteredPages = filteredPages.filter(p => !getVal(p, prop) || getVal(p, prop).length == 0)

            } else if (isLink(filter)) {
            
                filteredPages = filteredPages.filter(p => {
                    let val = fixList(getVal(p, prop)) 
                    return listContainsPath (val, filter.path)
                })

            } else if (filter && filter != "all") {
                filteredPages = filteredPages.filter(p => {
                    let val = getVal(p, prop)
                    if (!val) {return false} else {
                    return val.includes(filter)
                    }
                })
            } 
            return filteredPages
        }
    }



	else if (propType == "checkbox") {
		if (filter == "-") {
	    	return filteredPages.filter(p => getVal(p, prop) === undefined)
		} else if (filter === false) {
			return filteredPages.filter(p => getVal(p, prop) === false || getVal(p, prop) === null)	
 		} else if (filter != "all" && filter != null) {
	  		return filteredPages.filter(p => getVal(p, prop) == filter)
		} else return filteredPages
	}
	
	
	else if (propType == "date") {
		if (filter == "-") {
	    	return filteredPages.filter(p => getVal(p, prop) === undefined)
		} else if (filter != "all" && filter != null) {
		  if (filter.isLuxonDateTime) {
		    filter = filter.toFormat("yyyy-MM-dd")
		  }
	  	return filteredPages.filter(p => {
	  	  let val = getVal(p, prop)
	  	  if (val) {
	  	    return val.toFormat("yyyy-MM-dd") == filter
	  	  }
	  	  else return false
	  	})
		} else return filteredPages
	}
	
	
	
	else if (propType == "datetime") {
		if (filter == "-") {
	    	return filteredPages.filter(p => getVal(p, prop) === undefined)
		} else if (filter != "all" && filter != null) {
		  if (filter.isLuxonDateTime) {
		    filter = filter.toFormat("yyyy-MM-ddTHH:mm:ss")
		  }
	  	return filteredPages.filter(p => {
	  	  let val = getVal(p, prop)
	  	  if (val) {
	  	    return val.toFormat("yyyy-MM-ddTHH:mm:ss") == filter
	  	  } else return false
	  	})
		} else return filteredPages
	}







    return filteredPages
}







// Check if prop is link and path is given string

containsPath(prop, text) {
  if (prop && prop.path && prop.path == text) {
    return true
  } else return false
}

listContainsPath(prop, text) {
  if (prop && Array.isArray(prop) && prop.find(p => p.path && p.path == text)) {
    return true
  } else if (prop && Array.isArray(prop)) {
    prop = prop.filter(p => p.path)
    for (let property of prop) {
      if (!property.path.match(".md") && (text == property.path + ".md" || text.match("/" + property.path + ".md"))) {
        return true
      }
    }
  } else return false
}


















// Create buttons to change filters


async filterButtonProps(props, pages) {
    props = props.filter(p => p.filter)
	for (let p of props) {
		await this.filterButton(p, pages)
	}
}







async filterButton(p, pages, className) {
	const {dv} = this
	let {prop, multiSelect, name, buttonName} = p
	
	if (!buttonName) {
	  buttonName = prop
	  if (name) {
	    buttonName = name
  	}
	}
	
	

	
	let current = dv.current()
    let propName = "filter_" + prop
    let buttonClass = "dvit-button"

    if (!className) {
        if (current[propName] && current[propName] != "all" && current[propName].length != 0) {
            buttonClass = "dvit-button button-selected"
        }
    } else {
        buttonClass = className
    }
	 

    if (multiSelect) {
        let propNameInclude = "filter_include_" + prop
        let propNameExclude = "filter_exclude_" + prop
        if ((current[propNameInclude] && current[propNameInclude].length != 0) || 
        (current[propNameExclude] && current[propNameExclude].length != 0)) {
		    buttonClass = "dvit-button button-selected"
	    }
    }

    let button = document.createElement("button")


    if (p.icon) {
        let iconWrapper = document.createElement("span")
        iconWrapper.className = "filter-button-icon"
        let iconEl = obsidian.getIcon(p.icon)
        if (iconEl) {
            obsidian.setIcon(iconWrapper, p.icon)
        } else iconWrapper.append("NO ICON")

        
        button.append(iconWrapper)
    }
    button.append(buttonName)
    button.className = buttonClass
    button.onclick = async () => {
        await this.changeProp(p, pages)    
    }


    



    dv.container.append(button)
}




getVal(page, prop) {
	let val = page[prop]
  if (prop.startsWith("file.")) {
      let propLevels = prop.split(".")
      val = page
      for (let level of propLevels) {
        val = val[level]
      }
    }
  if (prop == "tags") val = page.file.tags
  return val
}


getWikilinkPath(wikilink) {
    const {dv} = this
    let barelink = wikilink.replace("[[", "").replace("]]", "")
    return dv.page(barelink).file.path
}




getValues(prop) {
    let values = app.metadataCache.getFrontmatterPropertyValuesForKey(prop)
    values.unshift("")
    return values
}

getValueNames(values, propType, filter) {

    let valueNames = values.map((v) => {
        if (v == "all") return "-all-"
        if (filter == v || (
            v.startsWith("[[") && filter && filter.path == this.getWikilinkPath(v)
            )      
        ) {
            v = v + " ✔"
        }
        return v
    })

    return valueNames
}





async changeProp(p, pages) {
    const {dv} = this
    const getVal = this.getVal
    
    let { prop, multiSelect, fuzzySearch } = p
    let current = dv.current()


    let suggester = async (values, names) => {
        if (fuzzySearch) {
            return await this.fuzzySuggester(values, names)
        } else {
            return await this.suggester(values, names)
        } 
    }


    let propType = this.getPropType(prop)


    if (propType == "text") {

        let currentFile = await app.vault.getAbstractFileByPath(current.file.path)
        let propName = "filter_" + prop
        let filter = current[propName]




    let values = pages.map(p => getVal(p, prop))

        values = values.map(v => {
            if (v && v.path) {
                let path = v.path.replace(".md", "")
                
                return  "[[" +  path + "]]"
            } else return v
        })

        values = [...new Set(values)]
        values = values.filter(v => v)
        values.sort()
        values.unshift("-")
        values.unshift("all")


        let valueNames = values.map((v) => {
            

            if (v == "all") return "-all-"
            if (filter && (filter == v || (filter.path && "[[" + filter.path.replace(".md", "") + "]]" == v))) {
				v = v + " ✔"
            }
            return v
        })




        let val = await suggester(values, valueNames)

        if (!val) {val = "-"}



        if (val == "all") {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                delete frontmatter[propName]
                frontmatter.pagination = 0
            })
            
        } else {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                frontmatter[propName] = val
                frontmatter.pagination = 0

            })
        }
    }


    if (propType == "number") {
        let currentFile = await app.vault.getAbstractFileByPath(current.file.path)
        let propName = "filter_" + prop
        let values = pages.map(p => getVal(p, prop))
        
        values = [...new Set(values)]
        values = values.filter(v => v).map(v => v + "")
        values.sort()
        values.unshift("-")
        values.unshift("all")
        
        let val = await this.suggester(values)

        if (!val) {val = "-"}
        
        if (val == "all") {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                delete frontmatter[propName]
                frontmatter.pagination = 0
            })
            
        } else {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                frontmatter[propName] = val
                frontmatter.pagination = 0

            })
        }
    }

    
    if (propType == "date" || propType == "datetime") {

        let currentFile = await app.vault.getAbstractFileByPath(current.file.path)
        let propName = "filter_" + prop
        let values = pages.map(p => {
          let val = getVal(p, prop)
          if (val && propType == "date") {
            val = val.toFormat("yyyy-MM-dd")
          } else if (val) {
            val = val.toFormat("yyyy-MM-ddTHH:mm:ss")
          }
          return val
        })
        
       

        values = [...new Set(values)]
        values = values.filter(v => v)
        values.sort()
        values.unshift("-")
        values.unshift("all")
        
        
        let dateFormat = app.plugins.plugins.dataview.settings.defaultDateFormat
        let locale = localStorage.getItem('language')
        
        let valueNames = values.map(v => {
          if (v == "all" || v == "-") {
            return v
          } else {
            return dv.date(v).toFormat(dateFormat, {locale: locale})
          }
        })

        
        
        let val = await suggester(values, valueNames)

        if (!val) {val = "-"}



        if (val == "all") {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                delete frontmatter[propName]
                frontmatter.pagination = 0
            })
            
        } else {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                frontmatter[propName] = val
                frontmatter.pagination = 0

            })
        }
    }
    
    if (propType == "multitext" && !multiSelect) {

		let currentFile = app.vault.getAbstractFileByPath(current.file.path)
		let propName = "filter_" + prop
        let filter = current[propName]

		let values = pages.map(p => {
		    let val = getVal(p, prop)
		    if (val) return val
		    else return []     
		})
		
		
		

		let multiValues = []
		for (let v of values) {

            // Fix for wrong properties, where it is text instead of list
            if (!Array.isArray(v)) {
                v = [v]
            }    

            if (v) {
                for (let m of v) {
                    multiValues.push(m)
                }
            } 
		}

	    multiValues = multiValues.map(v => {
            if (v && v.path) {
                let path = v.path.replace(".md", "")
                return  "[[" +  path + "]]"
            } else return v
        })
	
		multiValues = [...new Set(multiValues)]
		multiValues = multiValues.filter(v => v)
		multiValues.sort()
		multiValues.unshift("-")
        multiValues.unshift("all")

		let valueNames = multiValues.map((v) => {
			let valueName
			if (v == "all") valueName = "-all-"
			else valueName = v
			
			if (filter && (filter == v || (filter.path && "[[" + filter.path.replace(".md", "") + "]]" == v))) {
				return valueName + " ✔"
			} else return valueName
		})

        let val = await suggester(multiValues, valueNames)
		if (!val) {val = "-"}

		
        if (val == "all") {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                delete frontmatter[propName]
                frontmatter.pagination = 0
            })
            
        } else {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                frontmatter[propName] = val
                frontmatter.pagination = 0

            })
        }
	}



    if (propType == "multitext" && multiSelect) {

		let currentFile = app.vault.getAbstractFileByPath(current.file.path)
		let includePropName = "filter_include_" + prop
		let excludePropName = "filter_exclude_" + prop
        let allValuesPropName = "filter_all_values_" + prop
    	let includeFilter = current[includePropName]
		let excludeFilter = current[excludePropName]
        let allValues = current[allValuesPropName]
        

        if (!allValues && allValues !== false) {
            allValues = false
        }

		if (!includeFilter) includeFilter = []
        else {
            includeFilter = includeFilter.map(f => {
                if (f.path) return "[[" + f.path.replace(".md", "") + "]]"
                else return f
            })
        }

		if (!excludeFilter) excludeFilter = []
        else {
            excludeFilter = excludeFilter.map(f => {
                if (f.path) return "[[" + f.path.replace(".md", "") + "]]"
                else return f
            })
        }

		let filter = {include: includeFilter, exclude: excludeFilter, allValues}

		let values = pages.map(p => {
		    let val = getVal(p, prop)
		    if (val) return val
		    else return []
		})
		
		
		

		let multiValues = []
		for (let v of values) {

            // Fix for wrong properties, where it is text instead of list
            if (!Array.isArray(v)) {
                v = [v]
            }

            if (v) {
                for (let m of v) {
                    multiValues.push(m)
                }
            } 
		}

	    multiValues = multiValues.map(v => {
            if (v.path) {
                let path = v.path.replace(".md", "")
                return  "[[" +  path + "]]"
            } else return v
        })
	
		multiValues = [...new Set(multiValues)]
		multiValues = multiValues.filter(v => v)
	
		multiValues.sort()
		multiValues.unshift("-")

		let valueNames = multiValues.map((v) => {
			let valueName
			if (v == "all") valueName = "-all-"
			else if (v.startsWith("[[")) valueName = "⩈ " + v.replace(/(.*)(\/)([^\/]+)(\]\])/, "$3").replace(/(\[\[)(.*)(\]\])/, "$2")
            else valueName = v
			return valueName
		})

		let newFilter = await this.multiSuggestDouble(name, valueNames, multiValues, filter)


        if ((!newFilter.include || newFilter.include.length == 0) &&
        (!newFilter.exclude || newFilter.exclude.length == 0)) {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                delete frontmatter[includePropName]
                delete frontmatter[excludePropName]
                delete frontmatter[allValuesPropName]
                frontmatter.pagination = 0
            })
            
        } else {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                frontmatter[includePropName] = newFilter.include
                frontmatter[excludePropName] = newFilter.exclude
                frontmatter[allValuesPropName] = newFilter.allValues
                frontmatter.pagination = 0

            })
        }
        





	}



	

	if (propType == "checkbox") {
		let currentFile = app.vault.getAbstractFileByPath(current.file.path)
		let propName = "filter_" + prop

    let values = ["all", "-", "false", "true"]
		let val = await suggester(values)
		if (val == "false") val = false
		if (val == "true") val = true

		app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
		    frontmatter[propName] = val
			frontmatter.pagination = 0
		})

	}
    setTimeout(async() => {
	        await app.commands.executeCommandById("dataview:dataview-force-refresh-views")
	    }, 250)
    
}
















// Button to create new notes

async newEntryButton(dv, args) {

    const { noteName, noteTemplate, noteFolder } = args

	let template = await app.vault.getFiles().find(f => f.basename == noteTemplate)
	let data = ""

	if (template) {
		data = await app.vault.read(template)
	}

	const checkIfExist = (num) => {
		let numString = ""
		if (num > 0) {numString = " " + num}

        let path = noteName + numString + ".md"

        if (noteFolder && noteFolder != "") {
            path = noteFolder + "/" + noteName + numString + ".md"
        }
        

		let checkPath = app.vault.getAbstractFileByPathInsensitive(path)

	    if (checkPath) {
			return checkIfExist(num + 1)
		} else return path
	}

	
	const createNote = async (path, data) => {
		let file = await app.vault.create(path, data)
		app.workspace.getLeaf().openFile(file)
	}

    let button = document.createElement("button")
    button.append("+")
    button.className = "dvit-button"
    button.onclick = async () => {
        let path = checkIfExist(0)
        await createNote(path, data)    
    }
    dv.container.append(button)
}












// Refresh button


async refreshButton() {
  const {dv} = this
    let button = document.createElement("button")
    
    
    button.append("↺")
    button.className = "dvit-button"
    button.onclick = async () => {
        await app.commands.executeCommandById("dataview:dataview-force-refresh-views")
    }
    dv.container.append(button)
}
	
	
	
	
	
	
	
	

// Pagination

async increasePagination(increase, current) {
	
	let currentFile = app.vault.getAbstractFileByPath(current.file.path)
	let pagination = current.pagination

	if (!pagination) pagination = 0
    
	if (increase) {
		pagination++

        

		await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
			frontmatter.pagination = Number(pagination)
		})
        setTimeout(async() => {
	        await app.commands.executeCommandById("dataview:dataview-force-refresh-views")
	    }, 250)
	}
}



async decreasePagination(current) {

	let currentFile = app.vault.getAbstractFileByPath(current.file.path)
	let pagination = current.pagination
	if (!pagination) pagination = 0
	if (pagination > 0) {
		pagination--
		await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
			frontmatter.pagination = pagination
		})
        setTimeout(async() => {
	        await app.commands.executeCommandById("dataview:dataview-force-refresh-views")
	    }, 250)
	}
}



async nextPageButton(pagesCount) {
	const {dv} = this
	let current = dv.current()
	let pagination = current.pagination
	if (!pagination) pagination = 0
	  
	let buttonClass = "dvit-button"
	let increase = true
	if (pagination + 1 >= pagesCount) {
		buttonClass = "dvit-button button-gray"
		increase = false
	}
    

    let button = document.createElement("button")
    button.append(">>")
    button.className = buttonClass
    button.onclick = async () => {
        
        await this.increasePagination(increase, current)    
    }
    //dv.container.append(button)
    return button
}

	
	
async prevPageButton() {
  const {dv} = this
	let current = dv.current()
	let buttonClass = "dvit-button"
	let pagination = current.pagination
	if (!pagination) pagination = 0
	
	if (pagination <= 0) {
		buttonClass = "dvit-button button-gray"
	}

    let button = document.createElement("button")
    button.append("<<")
    button.className = buttonClass
    button.onclick = async () => {
        await this.decreasePagination(current)    
    }
    //dv.container.append(button)
    return button
}



currentPagination() {
  const {dv} = this
    let pagination = dv.current().pagination
    if (!pagination) pagination = 0
    return +pagination + 1
}
	


async paginationBlock(filteredPages, paginationNum) {
    
    const {dv} = this
    let pagesLength = filteredPages.length
    let remainder = pagesLength % paginationNum
    let pagesCount = (pagesLength - remainder) / paginationNum
    if (remainder != 0) pagesCount++
    let prev = await this.prevPageButton()
    let next = await this.nextPageButton(pagesCount)
    let block = document.createElement("span")
    block.append(prev)
    block.append(this.currentPagination())
    block.append(next)
    block.append(pagesCount)
    block.style = "white-space:nowrap"
    dv.container.append(block)
   
   
}



paginate(rows, num, current) {
    let pagination = current.pagination
    if (!pagination) pagination = 0
    return rows.slice(num * pagination, num * (+pagination + 1))
}









// EXTRA FUNCTIONS

// Join tags to one string

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
	

// Join list values to one string and wrap them in spans with unique classes

spanList(arr) {
    let result = ""
    if (arr == null) {
        return ""
    } else {
        for (let a of arr) {
            
            if (typeof a == "string" && !a.startsWith("<svg")) {
    
                result += "<span class='dv-tag dv-tag-" + a.replaceAll(" ", "-") + "'>" + a + "</span> "
            } else if (result.length == 0) {
    
                result = result + a
            } else result = result + ", " + a
        }
        return result
    }
}


// wrap text values in spans with unique classes

spanSingle(val) {
    
    
    if (val == null) {
        return ""
    } else {
        return "<span class='dv-tag dv-tag-" + val.replaceAll(" ", "-") + "'>" + val + "</span> "
    }
}
	
	
	




// Progress bar based on task completion in note

taskProgress(p) {
    let tasks = p.file.tasks.filter(t => t.children.length == 0)
    let completed = tasks.filter(t => t.completed == true)
    let max = tasks.length
    let value = completed.length
    if (max > 0) {
        return "<div class='task-progress'><progress max=" + max + " value=" + value + "></progress> <span>" + value + " / " + max + "</span></div>"
    } else return ""
}







// Get canvas files and create mockup canvas pages array

async getCanvasPages() {
  const {dv} = this
    let canvases = await app.vault.getFiles().filter(f => f["extension"] == "canvas")
    canvases = [...canvases]
    
    let canvasPages = canvases.map(c => {
        if (c.parent.path == "/" || !c.parent.path) {
            c.folder = ""
        } else {
            c.folder = c.parent.path + "/"
        }
        c.ext = c.extension
        c.name = c.basename + ".canvas"
        c.link = "[[" + c.folder + c.name + "|" + c.basename + "]]"
        return {file: c, type: "canvas"}
    })
    
    return dv.array(canvasPages)
}






getDisplay(link) {
  let display = link.display
  if (!display) {
    display = link.path.replace(/(.*\/)([^/]+)(\.[^\.]+)/,"$2")
  }
  return display
}


async createList(props, pages, filteredPages, paginationNum) {
   const {dv} = this
    let current = dv.current()
    filteredPages = await this.filterProps(props, current, filteredPages)

    
    filteredPages = await this.paginate(filteredPages, paginationNum, current)
     
    for (let page of filteredPages) {
        let link = page.file.link
        if (page.title) {
        link.display = page.title
        }

        let propItem = props.find(p => p.prop == "link" && p.type == "file prop")

        if (propItem) {
            let propVal = page.file.link
            if (propItem.prepend) {
            let prependText = ""
            if (propItem.prepend.type == "list") {
            let prependItems = page[propItem.prepend.prop]

            for (let item of prependItems) {
                if (propItem.prepend.slice) {
                    item = item.slice(...propItem.prepend.slice).trim() 
                }
                prependText = prependText + item
            }
            } else if (propItem.prepend.type == "text") {
            prependText = page[propItem.prepend.prop]

            if (propItem.prepend.slice) {
                prependText = prependText.slice(...propItem.prepend.slice).trim()  
            }
            }
            link = prependText + " " + propVal 
            }
        } 



    
     dv.paragraph(link)
    }
}



























async createTable(props, pages, filteredPages, paginationNum, fullWidth, cardsView) {
    const {dv} = this
    let current = dv.current()

    filteredPages = await this.filterProps(props, current, filteredPages)
    filteredPages = await this.paginate(filteredPages, paginationNum, current)


    let tableProps = props.filter(p => p.column)

    if (app.isMobile) {
        tableProps = tableProps.filter(p => !p.hideOnMobile)
    }

  

    let headers = tableProps.map(propItem => {
        let icon = ""
        if (propItem.icon) {
            let iconEl = obsidian.getIcon(propItem.icon)
            if (iconEl) {
                icon = iconEl.outerHTML
            } else icon = "NO ICON"
        }
        
      if (propItem.name) return icon + propItem.name
      else return icon + propItem.prop

    })





    let rows = filteredPages.map(p =>
        tableProps.map(propItem => {
          
        
            
            let propName = propItem.prop
            let propType = this.getPropType(propName)
            let propVal = this.getVal(p,propName)


            
            
            
            /* Slice text in list items*/

            if (propType == "multitext" && propItem.slice && propVal && Array.isArray(propVal)) {
                propVal = propVal.map(p => {
                  if (p.path) {
                    let display = p.display
                    if (!display) {
                      display = p.path.replace(/(.*?)([^\/]*)(\.md)/,"$2")
                    }
                    p.display = display.slice(...propItem.slice)
                  } else {
                    p = p.slice(...propItem.slice)
                  }
                  return p
                })
            }



            /* Replace text in list items*/

            if (propType == "multitext" && propItem.replace && propVal && Array.isArray(propVal)) {
                propVal = propVal.map(p => {
                  if (p.path) {
                    let display = p.display
                    if (!display) {
                      display = p.path.replace(/(.*?)([^\/]*)(\.md)/,"$2")
                    }

                    propItem.replace.forEach(r => {
                        if (r[2] == "icon") {
                            let iconEl = obsidian.getIcon(r[1])
                            if (iconEl) r[1] = iconEl.outerHTML.replace("svg-icon", "svg-icon dv-tag dv-tag-" + r[0])
                        }
                        p.display = display.replace(...r)
                    }) 
                  } else {
                    propItem.replace.forEach(r => {
                        if (r[2] == "icon") {
                            
                            let iconEl = obsidian.getIcon(r[1])
                           
                            if (iconEl) {
                                r[1] = iconEl.outerHTML.replace("svg-icon", "svg-icon dv-tag dv-tag-" + r[0])
                            }
                        }
                        p = p.replace(...r)
                    }) 
                  }
                  return p
                })
            }







            /* Slice text */
            
            if (propType == "text" && propItem.slice && propVal) {
              if (propVal.path) {
               let display = propVal.display
                    if (!display) {
                      display = propVal.path.replace(/(.*?)([^\/]*)(\.md)/,"$2")
                    }
                    propVal.display = display.slice(...propItem.slice)
              } else {
                propVal = propVal.slice(...propItem.slice)
              }
            }



            /* Wrap list items into span elements*/

            if (Array.isArray(propVal) && propItem.span) {
                propVal = this.spanList(propVal)
            }

            /* Wrap normal text into span element */

            if ((propType == "text") && !Array.isArray(propVal)  && propItem.span) {
                propVal = this.spanSingle(propVal)
            }
            
            /* Set text element max height */

            if ((propType == "text") && propItem.textHeight) {
                if (!propVal) propVal = ""
                propVal = "<div class='longText' style='max-height: " + propItem.textHeight + "px'>" + propVal + "</div>"
            }

            /* Render property as image */
            
            if (propItem.image) {
              let imageWidth = 100
              if (propItem.width) imageWidth = propItem.width
              if ( propVal && propVal.path && !propVal.path.endsWith(".md")) {
                    propVal = dv.fileLink(propVal.path, true, imageWidth)
                } else if (propVal && !propVal.path && propVal.startsWith("http")) {
                    propVal = "![|" + imageWidth + "](" + propVal + ")"
                } else propVal = ""
            }



            /* Show file properties */

            if (propType == "file prop") {
                propVal = p.file[propName]
                
                if (propVal && propItem.slice) {
                  if (propVal.path) {
                    let display = propVal.display
                    if (!display) {
                      display = propVal.path.replace(/(.*?)([^\/]*)(\.md)/,"$2")
                    }
                    propVal.display = display.slice(...propItem.slice)
                  } else {
                    propVal = propVal.slice(...propItem.slice)
                  }
                }
                
                if (propItem.prepend) {
                    let prependText = ""
                    if (propItem.prepend.type == "list") {
                        let prependItems = p[propItem.prepend.prop]
                    
                        for (let item of prependItems) {
                            if (propItem.prepend.slice) {
                                item = item.slice(...propItem.prepend.slice).trim() 
                            }
                            prependText = prependText + item
                        }
                    } else if (propItem.prepend.type == "text") {
                        prependText = p[propItem.prepend.prop]
                    
                        if (propItem.prepend.slice) {
                            prependText = prependText.slice(...propItem.prepend.slice).trim()  
                        }
                    }
                    propVal = prependText + " " + propVal 
                }
            }


            /* Show tags in one line */

            if (propName == "tags") {
                propVal = this.joinTags(p.file.tags)
            }



            /* Show task progress bar */

            if (propName == "taskProgress") {
                propVal = this.taskProgress(p)
            }


    /* Push property and everything after it to the bottom of the card */

            if (propItem.alignBottom) {
                propVal = "<span class='align-bottom'>" + propVal + "</span>"
            }
            


            


            
            /* Make property elements editable */

            

                let editButton = document.createElement("div")
                editButton.classList.add("edit-button")
                
            if (!propName.startsWith("file.")) {

                if (propItem.editButton == "select" && (propType == "text" || propType == "multitext")) {
                    //editButton.classList.add("edit-button-select")
                    editButton.setAttribute('data-type', 'select')

                }

                if (propType == "text" && propItem.editButton != "select") {
                    editButton.setAttribute('data-type', 'text')

                }


                if (propType == "multitext" && propItem.editButton != "select") {
                    //editButton.classList.add("edit-button-list")
                    editButton.setAttribute('data-type', 'list')

                }


                if (propType == "date") {
                    //editButton.classList.add("edit-button-date")
                    editButton.setAttribute('data-type', 'date')

                    if (propVal) {
                        let dateFormat = app.plugins.plugins.dataview.settings.defaultDateFormat
                        let locale = localStorage.getItem('language')
                        propVal = propVal.toFormat(dateFormat, {locale: locale})
                    } 
                }

                if (propType == "number") {
                    editButton.setAttribute('data-type', 'number')
                }

            }

            if (propName == "file.link" || propName == "file.name") {
                editButton.setAttribute('data-type', 'file name')
                //propVal = "<div>" + propVal + "</div>"
            }   

            

                editButton.setAttribute('data-path', p.file.path)
                editButton.setAttribute('data-prop', propName)

                if (Array.isArray(propVal)) {
                    let propArr = document.createElement("ul")
                    for (let propElData of propVal) {
                        let propEl = document.createElement("li")
                        propEl.append(propElData)

                        propArr.append(propEl)
                    }
                    propVal = propArr.outerHTML
                }

                editButton.innerHTML = propVal


      

                if (!editButton.innerHTML || editButton.innerHTML == "null" || editButton.innerHTML == "undefined") {
                    editButton.innerHTML = propName
                    editButton.classList.add("edit-button-empty")
                }


                propVal = editButton

                

            


          

            if (propType == "checkbox") {
                propVal = '<input type="checkbox" class="prop-checkbox" data-path="' + p.file.path + '" data-prop="' + propName + '">'
            }


            if (propName == "slider") {

                let propSliderVal = propItem.propVal
                let propMax = propItem.propMax
                let max = p[propMax]

                if (max) {
                    let slider = '<input type="range" max=' + p[propMax] + ' step="1" class="slider table-property-slider" data-path="' + p.file.path + '" data-prop="' + propSliderVal + '" data-prop="' + propMax + '">'

                    let sliderWrapper = document.createElement("div")
                    sliderWrapper.innerHTML = slider
                    propVal = sliderWrapper
                } else {
                    propVal.innerHTML = "Slider"
                    propVal.classList.add("edit-button-empty")
                    propVal.setAttribute('data-type', 'number')
                    propVal.setAttribute('data-prop', propMax)
                }

                if (propItem.alignBottom) {
                    propVal.classList.add("align-bottom")
                } 
            }




            





            return propVal
        }))
    



    let markdownTable = dv.markdownTable(headers, rows)
    let tableWrapper = dv.paragraph(markdownTable)

    tableWrapper.classList.add("dv-table-wrapper")

    if (fullWidth) {
        tableWrapper.classList.add("full-width")
    }

    
    if (!cardsView) {
        tableWrapper.classList.add("table")
    }


    if (cardsView) {
        tableWrapper.classList.add("cards")
        if (cardsView.position) {
            tableWrapper.classList.add("cards-" + cardsView.position)
        }
    }



    /* Add actions for editing buttons */

    let editButtons = document.querySelectorAll(".edit-button")
    for (let button of editButtons) {
      
        button.onclick = async (event) => {
            if (event.target.localName != "a") {
                let path = button.getAttribute("data-path")
                let prop = button.getAttribute("data-prop")
                let type = button.getAttribute("data-type")
                await this.editProp(type, path, prop, dv)
            } 
        }
    }


    



    let sliders = document.querySelectorAll(".table-property-slider")
    for (let slider of sliders) {
        let prop = slider.getAttribute("data-prop")
        let path = slider.getAttribute("data-path")
        let page = dv.page(path)

        let val = page[prop]
        if (!val) val = 0
        slider.value = val

        this.updateSlider(slider)
        slider.oninput = async () => {
            this.updateSlider(slider)
            await this.editSlider(slider)
        }
        slider.ondblclick = async () => {
            await this.editSliderVal(slider, dv)
        }

    }



    let checkboxes = document.querySelectorAll(".prop-checkbox")
    for (let checkbox of checkboxes) {
        let prop = checkbox.getAttribute("data-prop")
        let path = checkbox.getAttribute("data-path")
        let page = dv.page(path)
        
        checkbox.checked = page[prop]

        checkbox.onchange = async() => {
            let file = app.vault.getAbstractFileByPath(path)
            await app.fileManager.processFrontMatter(file, (frontmatter) => { 
                frontmatter[prop] = checkbox.checked
            })
        }
    }
}


/* Functions to edit properties */

updateSlider (slider) {
    let setTooltip = customJS.obsidian.setTooltip
    let value = slider.value
    let max = slider.max
    let percents = this.getSliderPercents(value, max)
    let imageColor = "var(--color-red)"
    if (percents > 25) imageColor = "var(--color-yellow)" 
    if (percents > 50) imageColor = "var(--color-green)"
    if (percents > 75) imageColor = "var(--color-cyan)"
    if (percents == 100) imageColor = "var(--color-purple)"
    slider.style.backgroundSize = percents + "% 100%"
    slider.style.backgroundImage = "linear-gradient(" + imageColor + ", " + imageColor + ")"
    setTooltip(slider, value, {placement: "top", delay: 1})
}


getSliderPercents (value, max) {
    let val = value
    if (!val) val = 0
    if (!max) {
        val = 0
        max = 0
    }

    if (Number(val) > Number(max)) {
        val = max
    }

    return Math.round(val * 100 / max)
}

async editSlider (slider) {
    let path = slider.getAttribute("data-path")
    let prop = slider.getAttribute("data-prop")
    let file = app.vault.getAbstractFileByPath(path)
    await app.fileManager.processFrontMatter(file, (fm) => {
        fm[prop] = Number(slider.value)
    })
}

async editSliderVal (slider, dv) {
    let path = slider.getAttribute("data-path")
    let prop = slider.getAttribute("data-prop")
    await this.editProp("number", path, prop, dv)
}


async editProp (type, path, prop, dv) {

    let page = dv.page(path)
    let file = app.vault.getAbstractFileByPath(path)

    if (type == "file name") {
        let prevName = file.basename
        let newName = await this.textInput("Title", prevName)
        if (!newName) newName = prevName
        let folder = file.parent.path
        let ext = file.extension

        let newPath = newName + "." + ext
        if (folder != "/") {
            newPath = folder + "/" + newName + "." + ext
        }

        await app.vault.rename(file, newPath)

        setTimeout(async() => {
            await app.commands.executeCommandById("dataview:dataview-force-refresh-views")
        }, 250)

        return
    }

    let prevVal = page[prop]

    if (this.isLink(prevVal)) {

        prevVal = "[[" + prevVal.path + "|" + this.getDisplay(prevVal) + "]]"

    }

    let val

    if (type == "text") {
        val = await this.textInput(prop, prevVal)
        if (val === undefined) val = prevVal

    } else if (type == "list") {

        let values = this.getValues(prop)
        if (!values) values = []
        if (!prevVal) prevVal = []
        if (typeof prevVal == "string") prevVal = [prevVal]


        let addedValues = [...prevVal]

        let notAddedValues = values.filter(v => {
            for (let a of addedValues) {
                if (v == a || v == "") return false
            }
            return true
        })

        notAddedValues.unshift("+ add new option")
        
        let command = await this.suggester(["add", "remove"])

        if (command == "add") {
            let addVal = await this.suggester(notAddedValues)

            if (addVal && addVal != "+ add new option") {
                addedValues.push(addVal)
            } else if (addVal == "+ add new option") {
                addVal = await this.textInput(prop, "")
                if (addVal) {
                    addedValues.push(addVal)
                }
            }

        } else if (command == "remove") {
            let removeVal = await this.suggester(addedValues)

            if (removeVal) {
                addedValues = addedValues.filter(a => a != removeVal)
            }
        }

        val = addedValues

    } else if (type == "select") {

        let values = this.getValues(prop)

        values.unshift("+ add new option")

        let valueNames = values.map(v => {
            if (v == "") return "-" 
            else return v
        })


        val = await this.suggester(values, valueNames)

        if (val == "+ add new option") {
            val = await this.textInput(prop, "")
            if (val === undefined) val = prevVal
        }


        let propType = this.getPropType(prop)

        if (propType == "multitext") {
            val = [val]
        }


    } else if (type == "number") {

        val = await this.numberInput(prop, prevVal)
        if (val === undefined) val = prevVal

    } else if (type == "date") {
     
        if (prevVal) {
            prevVal = prevVal.toISODate()
        }
        
        val = await this.dateInput(prop, prevVal)

        if (val === undefined) val = prevVal
    } 

    if (val !== prevVal) {
        await app.fileManager.processFrontMatter(file, fm => {
            fm[prop] = val
        })

        setTimeout(async() => {
            await app.commands.executeCommandById("dataview:dataview-force-refresh-views")
        }, 250)
    }
}









async renderView (settings, props, pages, dv) {

  let view = dv.current().view
  let cardsPosition = settings["cards image position"]
  let paginationNum = settings["entries on page"]
  let addNewButton = settings["add new note button"]
  let fullWidth = settings["full width"]
  this.dv = dv
  
  if (addNewButton) {
    let noteName = settings["new note name"]
    let noteTemplate = settings["new note template"]
    let noteFolder = settings["new note folder"]
    if (!noteName) noteName = "New note"

    let args = {
        noteName, 
        noteTemplate, 
        noteFolder
    }

    await this.newEntryButton(dv, args)
  }

    let filteredPages = [...pages]
    filteredPages = await this.filterProps(props, dv.current(), filteredPages)

    await this.filterButtonProps(props, pages)
    await this.changeViewButton(dv)
    await this.refreshButton()
    await this.paginationBlock(filteredPages, paginationNum)

  if (!view || view == "table") {
    await this.createTable(props, pages, filteredPages, paginationNum, fullWidth)

  } else if (view == "cards") {
    await this.createTable(props, pages, filteredPages, paginationNum, fullWidth, {cards: true, position: cardsPosition})

  } else if (view == "list") {
    await this.createList(props, pages, filteredPages, paginationNum)
  }
}

}
