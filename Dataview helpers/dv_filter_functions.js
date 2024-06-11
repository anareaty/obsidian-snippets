// Access Obsidian API

const plugins = app.plugins.plugins
let obsidian

if (plugins["templater-obsidian"]) {
    // Trying to get API from Templater
    obsidian = app.plugins.plugins["templater-obsidian"].templater.functions_generator.additional_functions().obsidian
} else if (plugins["customjs"]) {
    // Trying to get API from CustomJS
    obsidian = customJS.obsidian
} else {
    // Generate mockup plugin to load API
    if (!app.ObsidianAPI) {
        const dir = `${app.vault.configDir}/plugins/extract-obsidian-api`;
        await app.vault.adapter.mkdir(dir);
        const moduleFunc = () => {
            app.ObsidianAPI = require('obsidian');
            exports.default = app.ObsidianAPI.Plugin;
        };
        await app.vault.adapter.write(`${dir}/main.js`, `(${moduleFunc})();`);
        await app.vault.adapter.write(`${dir}/manifest.json`, `{"id":"extract-obsidian-api","name":"extract-obsidian-api","version":"1", "description":""}`);
        await app.plugins.loadManifests()
        await app.plugins.loadPlugin('extract-obsidian-api');
    }
 obsidian = app.ObsidianAPI
}




// Main class for all functions

this.dataviewFunctions = class df {












// MODAL WINDOWS

// Suggester modal

async suggester(names, values) {
    const {SuggestModal} = obsidian
    let data = new Promise((resolve, reject) => {
    
        this.MySuggestModal = class extends SuggestModal {
            getSuggestions() {
                return values
            }
            renderSuggestion(val, el) {
                el.createEl("div", {text: names[values.indexOf(val)]})
            }
            onChooseSuggestion(val, event) {
                resolve(val)
            } 
        }
    
        new this.MySuggestModal(app).open()  
    })
    return data
}





// Prompt modal

async prompt(name) {
    const {Modal, Setting} = obsidian
    let data = new Promise((resolve, reject) => {
        this.MyPromptModal = class extends Modal {
            constructor(app) {
                super(app);
            }

            onOpen() {
                const {contentEl} = this
                contentEl.createEl("h1", {text: "Text"})

                new Setting(contentEl).addText((text) => {
                    text.onChange((value) => {
                        this.result = value
                    })
                })

                new Setting(contentEl).addButton((btn) => btn
                .setButtonText("Save")
                .setCta()
                .onClick(() => {
                    resolve(this.result)
                    this.close()
                }))
            }

            onClose() {
                const {contentEl} = this
                contentEl.empty()
                reject("Text not submitted") 
            } 
        }

        new this.MyPromptModal(app).open()  
    
    }).catch((e) => {console.log(e)})
    return data
}




// Suggester modal with mutliselection

async multiSuggestDouble(header, names, values, existingValues) {
    const {Modal, Setting} = obsidian
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

                let modalStyle = document.createElement("style")
                modalStyle.id = "modal-style"
                modalStyle.innerHTML = `
                    .filter-checkbox.include.is-enabled {
                        background-color: var(--color-green); 
                        width: 22px; 
                        height: 22px; 
                        border-radius: 50%;
                    }

                    .filter-checkbox.include:not(.is-enabled) {
                        background-color: var(--color-base-35); 
                        width: 22px; 
                        height: 22px; 
                        border-radius: 50%;
                    }

                    .filter-checkbox.exclude.is-enabled {
                        background-color: var(--color-red); 
                        width: 22px; 
                        height: 22px; 
                        border-radius: 50%;
                    }

                    .filter-checkbox.exclude:not(.is-enabled) {
                        background-color: var(--color-base-35); 
                        width: 22px; 
                        height: 22px; 
                        border-radius: 50%;
                    }


                    .filter-checkbox.checkbox-container:after {
                        transform: none;
                        transition: none;
                        width: 22px; 
                        height: 22px;
                        margin: 0;
                        background-color: transparent;
                        text-align: center;
                        font-size: 16px;
                    
                    }

                    .filter-checkbox.include:after {
                        content: "+";
                    }

                    .filter-checkbox.exclude:after {
                        content: "-";
                    }

                    .filter-checkbox:not(.is-enabled):after {
                        opacity: 0.3;
                    }


                    .filter-checkbox.checkbox-container.is-enabled:active:after {
                        left: 0; 
                    }

                    .filter-checkbox.checkbox-container:focus-within {
                        outline: none; 
                    }
                
                `
                document.head.append(modalStyle)

                new Setting(contentEl)
                .setName("Result include all values")
                .addToggle((toggle) => {
                    toggle.setValue(this.result.allValues)
                    toggle.onChange((toggleValue) => {
                        this.result.allValues = toggleValue
                    })
                })


                new Setting(contentEl).addButton((btn) => btn
                .setButtonText("Clean all")
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
                .setButtonText("Save")
                .setCta()
                .onClick(() => {
                    resolve(this.result)
                    this.close()              
                }))
            }

            onClose() {
                let modalStyle = document.getElementById("modal-style")
                modalStyle.remove()
                const {contentEl} = this
                contentEl.empty()
                if (this.result) {
                    resolve(this.result)
                }
                reject("Text not submitted")
            } 
        }

        new this.MyPromptModal(app).open()  
    
    }).catch((e) => {console.log(e)})
    return data
}

















/* FILTER FUNCTIONS */

// Change view	

	async changeViewButton(values, prop, defaultView) {
        let currentView = dv.current()[prop]

        if (!currentView) {
            currentView = defaultView
        }

        let button = document.createElement("button")
        button.append("▽ " + currentView)
        button.className = "button-default button-choice"
        button.onclick = async () => {
            await this.changeView(values, prop, defaultView)    
        }
        dv.container.append(button)
	}


    async changeView(values, prop, defaultView) {
        let currentFile = await app.vault.getAbstractFileByPath(dv.current().file.path)

        let val = await this.suggester(values, values)


        let otherFilters = Object.keys(dv.current()).filter(key => key.startsWith("filter_"))

        
        if (!val || val == defaultView) {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
            delete frontmatter[prop]
            delete frontmatter.pagination
            for (let filter of otherFilters) {
                delete frontmatter[filter]
            }
        })
            
        } else {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
            frontmatter[prop] = val
            delete frontmatter.pagination
            for (let filter of otherFilters) {
                delete frontmatter[filter]
            }
        })

        }

        
        setTimeout(async() => {
	        await app.commands.executeCommandById("dataview:dataview-force-refresh-views")
	    }, 250)
	}

















// Filter


async filterProps(props, current, pages) {

	for (let p of props) {
        if (p.type) {
            let {prop, type, multiSelect} = p 
		    pages = await this.filter(prop, type, multiSelect, current, pages)
        }
	}
	return pages
}




async filter(prop, propType, multiSelect, current, filteredPages) {

	let propName = "filter_" + prop
	let filter = current[propName]


	if (propType == "text") {

		if (filter == "-") {
		  return filteredPages.filter(p => !p[prop])
		} else if (filter && filter.path) {
          return filteredPages.filter(p => {
              return p[prop] && p[prop].path == filter.path
            })
	    } else if (filter != "all" && filter != null) {
		  return filteredPages.filter(p => p[prop] == filter)
		} else return filteredPages
	}

	if (propType == "file prop") {
		if (filter == "-") {
	  		return filteredPages.filter(p => !p.file[prop])
		} else if (filter != "all" && filter != null) {
	  		return filteredPages.filter(p => p.file[prop] == filter)
		} else return filteredPages
	}


	if (propType == "list" && !multiSelect) {

        if (filter == "-") {
            filteredPages = filteredPages.filter(p => !p[prop] || p[prop].length == 0)
        } else if (filter && filter.path) {
            filteredPages = filteredPages.filter(p => {
                
                // Fix for wrong properties, where it is text instead of list
                if (p[prop] && !Array.isArray(p[prop])) {
                    p[prop] = [p[prop]]
                } 
                
                return p[prop] && p[prop].find(p => p.path && p.path == filter.path)
            })

        } else if (filter && filter != "all") {
            filteredPages = filteredPages.filter(p => {
                let propVal = p[prop]
                if (!propVal) {return false} else {
                return p[prop].includes(filter)
                }
            })
        } 
		return filteredPages
	}


    if (propType == "list" && multiSelect) {

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
                    filteredPages = filteredPages.filter(p => !p[prop] || p[prop].length == 0)
                } else if (f && f.path) {
                    filteredPages = filteredPages.filter(p => {
                        return p[prop] && p[prop].find(link => link.path == f.path)
                    })

                } else if (f) {
                    filteredPages = filteredPages.filter(p => {
                        let propVal = p[prop]
                        if (!propVal) {return false} else {
                        return p[prop].includes(f)
                        }
                    })
                } 
            }

            for (let f of excludeFilter) {

                if (f == "-") {
                    filteredPages = filteredPages.filter(p => p[prop] && p[prop].length != 0)
                } else if (f && f.path) {
                    filteredPages = filteredPages.filter(p => {
                        return !p[prop] || !p[prop].find(link => link.path == f.path)
                    })

                } else if (f) {
                    filteredPages = filteredPages.filter(p => {
                        let propVal = p[prop]
                        if (!propVal) {return true} else {
                        return !p[prop].includes(f)
                        }
                    })
                } 
            }
        } else if (includeFilter.length > 0) {

            filteredPages = filteredPages.map(p => {
                for (let f of includeFilter) {
                    if (f == "-" && (!p[prop] || p[prop].length == 0)) {
                        return p
                    } else if (f && f.path && (p[prop] && p[prop].find(link => link.path == f.path))){
                        return p
                    } else if (f && p[prop] && p[prop].includes(f)) {
                        return p
                    }
                }
                return false   
            })
            filteredPages = filteredPages.filter(p => p)  
        }
		return filteredPages
	}


	if (propType == "tags") {
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


	if (propType == "boolean") {
		if (filter == "-") {
	    	return filteredPages.filter(p => p[prop] === undefined)
		} else if (filter === false) {
			return filteredPages.filter(p => p[prop] === false || p[prop] === null)	
 		} else if (filter != "all" && filter != null) {
	  		return filteredPages.filter(p => p[prop] == filter)
		} else return filteredPages
	}
}




















// Create buttons to change filters


async filterButtonProps(props, pages) {
    props = props.filter(p => p.buttonName)
	for (let p of props) {
		let {prop, buttonName, type, multiSelect} = p 
		await this.filterButton(buttonName, prop, type, multiSelect, pages)
	}
}



async filterButton(name, prop, propType, multiSelect, pages) {
	let current = dv.current()
	let buttonClass = "button-default"
	let propName = "filter_" + prop

	if (current[propName] && current[propName] != "all" && current[propName].length != 0) {
		buttonClass = "button-default button-blue"
	} 

    if (multiSelect) {
        let propNameInclude = "filter_include_" + prop
        let propNameExclude = "filter_exclude_" + prop
        if ((current[propNameInclude] && current[propNameInclude].length != 0) || 
        (current[propNameExclude] && current[propNameExclude].length != 0)) {
		    buttonClass = "button-default button-blue"
	    }
    }

    let button = document.createElement("button")
    button.append(name)
    button.className = buttonClass
    button.onclick = async () => {
        await this.changeProp(prop, propType, multiSelect, pages)    
    }
    dv.container.append(button)
}



async changeProp(prop, propType, multiSelect, pages) {
    let current = dv.current()


    if (propType == "text") {

        let currentFile = await app.vault.getAbstractFileByPath(current.file.path)
        let propName = "filter_" + prop
        let values = pages.map(p => p[prop])

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
            else if (v && v.startsWith("[[")) {
                v = v.replace(/(.*)(\/)([^\/]+)(\]\])/, "$3")
                .replace(/(\[\[)(.*)(\]\])/, "$2")
                return "⩈ " + v
            
            } else return v
        })

        let val = await this.suggester(valueNames, values)

        if (!val) {val = "-"}



        if (val == "all") {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                delete frontmatter[propName]
                delete frontmatter.pagination
            })
            
        } else {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                frontmatter[propName] = val
                delete frontmatter.pagination

            })
        }
    }



	if (propType == "file prop") {

		let currentFile = app.vault.getAbstractFileByPath(current.file.path)
		let propName = "filter_" + prop
		let values = pages.map(p => p.file[prop])
		values = [...new Set(values)]
		values = values.filter(v => v)
		values.sort()
		values.unshift("-")
		values.unshift("all")

		let valueNames = values.map((v) => {
			if (v == "all") return "-all-"
			else return v
		})

		let val = await this.suggester(valueNames, values)
		if (!val) {val = "-"}



		
        if (val == "all") {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                delete frontmatter[propName]
                delete frontmatter.pagination
            })
            
        } else {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                frontmatter[propName] = val
                delete frontmatter.pagination

            })
        }
	}
    
    
    
    if (propType == "list" && !multiSelect) {

		let currentFile = app.vault.getAbstractFileByPath(current.file.path)
		let propName = "filter_" + prop
        let filter = current[propName]

		let values = pages.map(p => {
		    if (p[prop]) return p[prop]
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
			else if (v.startsWith("[[")) valueName = "⩈ " + v.replace(/(.*)(\/)([^\/]+)(\]\])/, "$3").replace(/(\[\[)(.*)(\]\])/, "$2")
            else valueName = v
			
			if (filter && (filter == v || (filter.path && "[[" + filter.path.replace(".md", "") + "]]" == v))) {
				return valueName + " ✔"
			} else return valueName
		})

        let val = await this.suggester(valueNames, multiValues)
		if (!val) {val = "-"}

		
        if (val == "all") {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                delete frontmatter[propName]
                delete frontmatter.pagination
            })
            
        } else {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                frontmatter[propName] = val
                delete frontmatter.pagination

            })
        }
	}



    if (propType == "list" && multiSelect) {

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
		    if (p[prop]) return p[prop]
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
                delete frontmatter.pagination
            })
            
        } else {
            await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
                frontmatter[includePropName] = newFilter.include
                frontmatter[excludePropName] = newFilter.exclude
                frontmatter[allValuesPropName] = newFilter.allValues
                delete frontmatter.pagination

            })
        }
        





	}



	if (propType == "tags") {

		let currentFile = app.vault.getAbstractFileByPath(current.file.path)
		let propName = "filter_tags"

		let values = pages.map(p => {
		  if (p.file.tags)  return p.file.tags
		  else return []
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
			if (v == "all") return "-all-"
			else return v
		})

		let val = await this.suggester(valueNames, multiValues)
		await app.fileManager.processFrontMatter(currentFile, (frontmatter) => { 
			frontmatter.filter_tags = val
			frontmatter.pagination = 0
		})
	}



	if (propType == "boolean") {
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
			if (!v) return "false"
			else if (v == "all") return "-all-"
			else return v
		})

		let val = await this.suggester(valueNames, values)
		if (!val) val = false

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

async newEntryButton(args) {

    const { buttonName, fileName, templatePath, folderName, open } = args

	let template = await app.vault.getFiles().find(f => f.path == templatePath)
	let data = ""

	if (template) {
		data = await app.vault.read(template)
	}

	const checkIfExist = (num) => {
		let x = ""
		if (num > 0) {x = num}
		let path = folderName + "/" + fileName + " " + x + ".md"
		let checkPath = app.vault.getAbstractFileByPath(path)
	    if (checkPath) {
			return checkIfExist(num + 1)
		} else return path
	}

	let path = checkIfExist(0)

	const createNote = async (path, data) => {
		let file = await app.vault.create(path, data)

		if (open) {
			app.workspace.getLeaf().openFile(file)
		}

        setTimeout(async() => {
	        await app.commands.executeCommandById("dataview:dataview-force-refresh-views")
	    }, 250)
	}

    let button = document.createElement("button")
    button.append(buttonName)
    button.className = "button-default"
    button.onclick = async () => {
        await createNote(path, data)    
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
			frontmatter.pagination = pagination
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
	let current = dv.current()
	let pagination = current.pagination
	if (!pagination) pagination = 0
	  
	let buttonClass = "button-default"
	let increase = true
	if (pagination + 1 >= pagesCount) {
		buttonClass = "button-default button-gray"
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
	let current = dv.current()
	let buttonClass = "button-default"
	let pagination = current.pagination
	if (!pagination) pagination = 0
	
	if (pagination <= 0) {
		buttonClass = "button-default button-gray"
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
    let pagination = dv.current().pagination
    if (!pagination) pagination = 0
    return +pagination + 1
}
	


async paginationBlock(filteredPages, paginationNum) {
    let pagesLength = filteredPages.length
    let remainder = pagesLength % paginationNum
    let pagesCount = (pagesLength - remainder) / paginationNum
    if (remainder != 0) pagesCount++
    //await this.prevPageButton()
   // dv.span(this.currentPagination())
   // await this.nextPageButton(pagesCount)
   // dv.span(pagesCount)
   let prev = await this.prevPageButton()
   let next = await this.nextPageButton()
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
            if (typeof a == "string") {
                result += "<span class='dv-tag dv-tag-" + a.replaceAll(" ", "-") + "'>" + a + "</span> "
            } else result += a
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
	
	
	
// Render boolean properties as clickable checkboxes
	
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




// Progress bars

// Progress bar based on task completion in note

taskProgress(p) {
    let tasks = p.file.tasks.filter(t => t.children.length == 0)
    let completed = tasks.filter(t => t.completed == true)
    let max = tasks.length
    let value = completed.length
    if (max > 0) {
        return "<progress max=" + max + " value=" + value + "></progress> <span style='font-size: 0.9em'>" + value + " / " + max + "</span>"
    } else return ""
}


// Big progress bar based on task completion in note with text and classes (to style with css)

styledTaskProgress(p) {
    let tasks = p.file.tasks
    let completed = tasks.filter(t => t.completed)
    let max = tasks.length
    let value = completed.length
    let percents = Math.round(100 * value / max)

    let color
    if (percents <= 30) { color = 'red-progress'}
    else if (percents <= 50) { color = 'yellow-progress'}
    else if (percents <= 80) { color = 'green-progress'}
    else if (percents < 100) { color = 'blue-progress'}
    else { color = 'purple-progress'}


    if (max > 0) {
        return "**Progress:** <progress class='progress-bar-middle " + color + "' max=100 value=" + percents + "> </progress> **" + value + "** / **" + max + "**"
    } else return ""
}



// Progress bar based on given values

propProgress(value, max) {
    if (max) {
        if (!value) value = 0
        return "<progress max=" + max + " value=" + value + "></progress><span style='font-size: var(--font-ui-smaller)'> " + Math.round(value * 100 / max) + " % </span>"
    } else return ""
}



// Big progress bar based on given values with text and classes (to style with css)

styledPropProgress(value, max) {
    if (max) {
        if (!value) value = 0
        let percents = Math.round(value / max * 100)

        let color
        if (percents <= 30) { color = 'red-progress'}
        else if (percents <= 50) { color = 'yellow-progress'}
        else if (percents <= 80) { color = 'green-progress'}
        else if (percents < 100) { color = 'blue-progress'}
        else { color = 'purple-progress'}

        return "**Progress**: <progress class='progress-bar-big " + color + "' max=100 value=" + percents + "> </progress> " + percents + "%"
    } else return ""	
}






// Get canvas files and create mockup canvas pages array

async getCanvasPages() {
    let canvases = await app.vault.getFiles().filter(f => f["extension"] == "canvas")
    let canvasPages = canvases.map(c => {

        if (c.parent.path == "/" || !c.parent.path) {
            c.folder = ""
        } else {
            c.folder = c.parent.path + "/"
        }
         
        c.ext = c.extension
        c.name = c.basename
        c.link = "[[" + c.folder + c.name + ".canvas|" + c.name + "]]"
        return {file: c, type: "canvas"}
    })
 
    return dv.array(canvasPages)
}












async createList(props, pages, filteredPages, paginationNum) {
    let current = dv.current()
    filteredPages = await this.filterProps(props, current, filteredPages)
    await this.filterButtonProps(props, pages)
    await this.paginationBlock(filteredPages, paginationNum)
    filteredPages = await this.paginate(filteredPages, paginationNum, current)
     
    for (let page of filteredPages) {
     dv.paragraph(page.file.link)
    }
}


async createTable(props, pages, filteredPages, paginationNum) {
    let current = dv.current()
    filteredPages = await this.filterProps(props, current, filteredPages)
    await this.filterButtonProps(props, pages)
    await this.paginationBlock(filteredPages, paginationNum)
    filteredPages = await this.paginate(filteredPages, paginationNum, current)


    let tableProps = props.filter(p => p.header)

    let headers = tableProps.map(propItem => propItem.header)

    let rows = filteredPages.map(p =>
        tableProps.map(propItem => {
            let propType = propItem.type
            let propName = propItem.prop
            let propVal = p[propName]

            if (propType == "list" && propItem.span) {
                propVal = this.spanList(propVal)
            }

            if (propType == "text" && propItem.span) {
                propVal = this.spanSingle(propVal)
            }

            if (propType == "text" && propItem.imageWidth) {
		if (propVal && propVal.path) {
                    propVal = dv.fileLink(propVal.path, true, propItem.imageWidth)
                } else if (propVal && propVal.startsWith("http")) {
                    propVal = "![|" + propItem.imageWidth + "](" + propVal + ")"
                }
            }

            if (propType == "boolean") {
                propVal = this.renderBoolean(p, propName)
            }

            if (propType == "file prop") {
                propVal = p.file[propName]
            }

            if (propName == "tags") {
                propVal = this.joinTags(p.file.tags)
            }

            if (propName == "taskProgress") {
                propVal = this.taskProgress(p)
            }

            return propVal
        }))

    dv.table(headers, rows)


    
}


}
