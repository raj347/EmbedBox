import "babel-polyfill"

import "./site.external-styl"
import * as examples from "./examples"

function handleRunClick({target}) {
  const key = target.getAttribute("data-example")

  examples[key]()
}

document.addEventListener("DOMContentLoaded", () => {
  Array
    .from(document.querySelectorAll("button.run"))
    .forEach(element => element.addEventListener("click", handleRunClick))
})