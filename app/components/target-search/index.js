import template from "./target-search.pug"
import stylesheet from "./target-search.styl"

import autobind from "autobind-decorator"
import BaseComponent from "components/base-component"
import * as icons from "components/icons"
import KM from "lib/key-map"
import findIndex from "lodash.findindex"

const {svgToComponent, search: SearchIcon, clear: ClearIcon, next: NextIcon} = icons
const entryQuery = id => `.entry[data-id=${id}]`

const DELTA_LOOKUP = {
  [KM.up]: -1,
  [KM.down]: 1
}

export default class TargetSearch extends BaseComponent {
  static template = template;
  static stylesheet = stylesheet;

  selectedId = null;

  get entrySpecs() {
    const {query, targets} = this
    const {fallbackID} = this.store

    return targets.map(({icon, id, label}) => {
      const hidden = query && label.toLowerCase().indexOf(query) === -1 && id !== fallbackID

      return {icon, id, label, hidden}
    })
  }

  @autobind
  handleSearchInput() {
    const {search} = this.refs
    const [firstVisible] = this.entrySpecs.filter(({hidden}) => !hidden)

    search.setAttribute("data-empty", search.value === "")
    this.query = search.value.toLowerCase()
    this.selectEntry(firstVisible ? firstVisible.id : null)
  }

  @autobind
  handleSearchInputClear() {
    const {entriesContainer, search} = this.refs

    search.value = ""
    this.handleSearchInput()
    this.selectEntry(null)
    search.focus()
    entriesContainer.scrollTop = 0
  }

  @autobind
  handleDelgatedKeydown({detail: {keyCode, nativeEvent, route}}) {
    const delta = DELTA_LOOKUP[keyCode || nativeEvent.keyCode]

    if (route !== "home") return
    if (!delta) return

    if (nativeEvent) nativeEvent.preventDefault()

    let {selectedId} = this
    const entrySpecs = this.entrySpecs.filter(spec => !spec.hidden)

    if (!entrySpecs.length) return

    const {length} = entrySpecs
    const currentIndex = findIndex(entrySpecs, ({id}) => id === selectedId) || 0

    // Move the index by delta and wrap around the bottom/top.
    const nextIndex = (currentIndex + delta + length) % length

    selectedId = entrySpecs[nextIndex].id

    this.selectEntry(selectedId)
  }

  @autobind
  handleDelgatedKeypress({detail: {keyCode, nativeEvent, route}}) {
    keyCode = keyCode || nativeEvent.keyCode

    if (route !== "home") return
    if (keyCode !== KM.enter) return
    if (nativeEvent) nativeEvent.preventDefault()

    this.submit()
  }

  @autobind
  submit() {
    if (!this.selectedId) return

    this.onSubmit(this.selectedId)
  }

  selectEntry(selectedId, options = {focus: true}) {
    const {entrySpecs} = this
    const {entries, entriesContainer, search} = this.refs
    const iframeDocument = this.store.iframe.document
    const entryEl = entriesContainer.querySelector(entryQuery(selectedId))
    const visibleSpecs = entrySpecs.filter(entry => !entry.hidden)

    this.selectedId = selectedId

    entries.forEach(entryEl => {
      entryEl.setAttribute("data-visible-order", -1)
      this.setEntryStyle(entryEl)
    })

    visibleSpecs.forEach((spec, index) => {
      const entryEl = entriesContainer.querySelector(entryQuery(spec.id))

      entryEl.setAttribute("data-visible-order", index)
    })

    if (search !== iframeDocument.activeElement && entryEl) {
      entryEl.focus()
    }

    if (options.focus) entryEl.scrollIntoView(false)
  }

  render() {
    this.compileTemplate()

    const {inputWrapper, search, searchClear} = this.refs
    const searchIcon = new SearchIcon()
    const clearIcon = new ClearIcon()

    inputWrapper.appendChild(searchIcon.render())
    searchClear.appendChild(clearIcon.render())

    search.addEventListener("input", this.handleSearchInput)
    searchClear.addEventListener("click", this.handleSearchInputClear)

    this.renderEntries()

    this.element.addEventListener("dispatched-keydown", this.handleDelgatedKeydown)
    this.element.addEventListener("dispatched-keypress", this.handleDelgatedKeypress)
    this.element.addEventListener("dispatched-input", this.handleSearchInput)

    return this.element
  }

  renderEntries() {
    const iframeDocument = this.store.iframe.document
    const {entriesContainer} = this.refs

    this.entrySpecs.forEach((spec, index) => {
      const Icon = svgToComponent(spec.icon)
      const icon = new Icon({class: "icon logo"})

      const entry = entriesContainer.appendChild(document.createElement("div"))
      const entryAttributes = {
        class: "entry",
        tabindex: 4,
        "data-action": "",
        "data-id": spec.id,
        "data-ref": "entries[]",
        "data-visible-order": index
      }

      const primary = iframeDocument.createElement("div")
      const primaryAttributes = {
        "data-click-hint": this.label("clickHint"),
        "data-click-hint-short": this.label("clickHintShort"),
        "data-submit-hint": this.label("submitHint"),
        "data-submit-hint-short": this.label("submitHintShort")
      }

      primary.className = "primary"
      primary.appendChild(icon.render())
      primary.appendChild(document.createTextNode(spec.label))
      Object.keys(primaryAttributes).forEach(key => primary.setAttribute(key, primaryAttributes[key]))

      entry.appendChild(primary)
      entry.appendChild(new NextIcon({class: "icon next"}).render())
      Object.keys(entryAttributes).forEach(key => entry.setAttribute(key, entryAttributes[key]))
      this.setEntryStyle(entry)

      this.updateRefs()

      entry.addEventListener("click", () => {
        this.selectEntry(spec.id, {focus: false})
        this.submit()
      })

      entry.addEventListener("keydown", event => {
        if (event.keyCode === KM.spacebar) {
          event.preventDefault()
          this.selectEntry(spec.id)
        }
      })
    })
  }

  setEntryStyle(entryEl) {
    if (entryEl.getAttribute("data-id") === this.selectedId) {
      entryEl.setAttribute("data-selected", "")
    }
    else {
      entryEl.removeAttribute("data-selected")
    }
  }
}
