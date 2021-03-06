/* eslint-env node, es6 */

const EmbedBoxBase = require("../app/embed-box-base").default
const targets = require("../app/targets")

EmbedBoxBase.fetchedTargets = [
  targets.wordpress,
  targets.shopify,
  targets.squarespace,
  targets.weebly,
  targets.drupal,
  targets.joomla,
  targets.generic
]

module.exports = EmbedBoxBase
