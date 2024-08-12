# Dataview interactive tables

## Description

This script is intended to be used in the Obsidian app with the Dataview plugin (also CustomJS plugin is required). With Dataview you can create tables and lists from the notes, but they are not editable. This script allows you to create dynamic interactive views with several additional options:
- you can filter your tables by properties with the help of the filtering buttons;
- you can use pagination to break your entries into separate pages;
- you can easily switch between table, cards ald list views;
- you can edit properties directly from the table, without opening the note;
- you can render properties as images, functional checkboxes and sliders;
- you can use different colors for different property values;
- you can refresh the view with the help of the special button;
- you can add the button to create new note from the view;
- you can do all this with the minimal touching of the code.

## How to set up

1. Install the Dataview plugin and turn on javascript in the plugin settings.
2. Install CustomJS plugin and set up the scripts folder in the plugin settings.
3. Download file [interactive-tables.js](https://github.com/anareaty/obsidian-snippets/blob/main/Dataview-interactive-tables/interactive-tables.js) and put it into the scripts folder.
4. Download files [dvit-cards.css](https://github.com/anareaty/obsidian-snippets/blob/main/Dataview-interactive-tables/dvit-cards.css) and [dvit-style.css](https://github.com/anareaty/obsidian-snippets/blob/main/Dataview-interactive-tables/dvit-style.css). Put them to the folder ".obsidian/snippets" and turn on the snippets in the Obsidian appearance settings.
5. Copy the code below into your Obsidian note:

````
```dataviewjs

// Select and filter pages as you normally do with dataviewjs

let pages = dv.pages()

// General view settings

const settings = {
    "entries on page": 10,
    "full width": true,
    "add new note button": true,
}

// Properties settings

const props = [
  {
    prop: "file.link", 
    name: "Name",
    filter: true,
    column: true
  },
  {
    prop: "tags",
    filter: true,
    column: true
  }
] 

await customJS.dvIT.renderView(settings, props, pages, dv)
```
````

6. Edit the code according to your needs (see below).

## How to edit

You can change the view by editing the "settings" object ant the "props" array.

### General settings

The "settings" object contains the general settings of the view. It can contain several optional parameters:

`"entries on page": <number>` — describes how many entries should be on one page. If you skip this option, there will be no pagination.

`"full width": true` — if you want the table to fill the full width of the page.

`add new note button": true` - if you want to add the button for new note creation. 

If you add new note button, you can also add parameters for the new note (they are also optional).

`new note name: <string>`

`new note folder: <string>`

`new note template: <string>`

You can also change the position of the cards images by adding:

`"cards image position": "horizontal"`

As a result your settings may look like this, for example: 

```js
const settings = {
    "entries on page": 10,
    "cards image position": "horizontal",
    "full width": true,
    "add new note button": true,
    "new note name": "New book",
    "new note folder": "Books",
    "new note template": "Book template"
}
```

### Properties settings

The "props" array describes, what properties are shown in the view. Each property has its own object, containing several attributes. For example:

```
{
  prop: "Property name",
  filter: true,
  column: true
}
```
Here are some options you can add to the property object:

`prop: <string>` — the name of the property (required).

`filter: true` — adds filtering button for this property on the top.

`column: true` — adds the column for this property to the table.

`name: <string>` — if you want to use alternative name for this property in table header and button.

`icon: <string>` — if you want to add icon to the property name in in table header and button. Only built-in lucide icons are supported. For example, `icon: "send"`.

`image: true` — property will be rendered as image. For this it must contain either external url link or wikilink to the local image.

`width: <number>` — sets the width of the image.

`fuzzySearch: true` — allows fuzzy search in filtering modal.

`span: true` — wraps property values into span tags with unique class names. It allows to use css for adding different colors for different values.

`multiSelect: true` — allows selecting multiple values in filtering modal. Only works with the list properties.

`editButton: select` — allows to select only one of existing options in editing modal. Works with text of list properties.

`slice: [0, 2],` — only show the first two symbols of property value (useful for properties starting with emojis).

`textHeight: <number>` — sets max height of the text property in table.

`alignBottom: true` — in the cards view push this property and all properties after to the bottom of the card.

`hideOnMobile: true` — don't show this property in the table on mobile.

Besides normal properties you can also use some file properties, like "file.link" or "file.path". Note that most of them are not editable for now, except for the note name. You can only access the first level file properties. 

You can use `file.tasks` property to get the list of file tasks with active checkboxes, and the filter button will allow you to switch between seing all tasks, just completed or just not completed. But the tasks support is very minimal for now and can be a little buggy.

There are additional two things you can put to the "props" array, that are not the properties. There are task progress and properties slider.

Task progress allow you to see the progress bar of all the tasks in the note. It is described like this:

```
{
    prop: "taskProgress",
    column: true  
}
```

Slider allows you to edit properties by dragging slider bar. It can be useful, for example, to track, how many chapters of a book you read etc. It described like this:

```
  {
    prop: "slider",
    column: true,
    propVal: "Value",
    propMax: "Max"
}
```
Slider requires two properties: maximal value and current value. If max value do not exist in the note, you can set it up by clicking on the slider cell. Double clicking on the slider allow you to change the value as a number.

## Additional styles

Using this script adds some additional properties to the note with the view. They are needed to store information about filters and other selected options. If you want to, you can hide these properties by adding css-snippet:

```css
  /* Hide interactive table properties */
  
  .metadata-property[data-property-key*="filter"],
  .metadata-property[data-property-key="view"],
  .metadata-property[data-property-key="pagination"] {
      display: none;
  }
```

You can also use css to change colors of specific property values. To do this you must add the `span: true` option to the property object. Then you need to create the css snippet. For example, you have the property "Status" with the possible values "in progress" and "completed" and you want "in progress" to be red and "completed" to be green. You can use the css like this:

```css
.dv-tag-in-progress {
    background-color: rgba(var(--color-red-rgb), .2);
}

.dv-tag-completed {
    background-color: rgba(var(--color-green-rgb), .2);
}
```

Note, that all spaces must be replaced by dashes.
