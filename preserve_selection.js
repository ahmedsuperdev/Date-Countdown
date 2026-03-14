function getMaxOffset(container) {
  return container.nodeType === Node.TEXT_NODE 
  ? container.length 
  : container.textContent.length;
}
/**
 * Retrieves the current selection's range and saves its data,
 * including parent elements, relative child indices for Text Nodes,
 * and the selection direction.
 * @returns {Object|null} An object containing the saved range data, or null if no selection exists.
 */
function saveSelectionRangeData() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  const data = {};
  data.isBackward = selection.direction === "backward";
  function processContainer(container, offset, prefix) {
    data[`${prefix}Container`] = container;
    data[`${prefix}Offset`] = offset;
    data[`${prefix}MaxBoundaries`] = offset == getMaxOffset(container);
    if (container.nodeType === Node.TEXT_NODE) {
      data[`${prefix}Parent`] = container.parentNode;
      let index = -1;
      const children = container.parentNode.childNodes;
      for (let i = 0; i < children.length; i++) {
        if (children[i] === container) {
          index = i;
          break;
        }
      }
      data[`${prefix}ChildIndex`] = index;
    }
  }
  processContainer(range.startContainer, range.startOffset, 'start');
  processContainer(range.endContainer, range.endOffset, 'end');
  return data;
}
/**
 * Constructs a new Range object from the saved data.
 * @param {Object} savedData - The object returned by saveSelectionRangeData.
 * @returns {Range} A new Range object.
 */
function constructRangeFromData(savedData) {
  const newRange = new Range();
  function getContainer(prefix) {
    const container = savedData[`${prefix}Container`];
    const parent = savedData[`${prefix}Parent`];
    const childIndex = savedData[`${prefix}ChildIndex`];
    if (parent && childIndex !== undefined && childIndex !== -1) {
      return parent.childNodes[childIndex];
    }
    return container;
  }
  const startContainer = getContainer('start');
  const endContainer = getContainer('end');
  newRange.setStart(startContainer,
    savedData.startMaxBoundaries ? getMaxOffset(startContainer)
    : Math.min(savedData.startOffset, getMaxOffset(startContainer))
  );
  newRange.setEnd(endContainer,
    savedData.endMaxBoundaries ? getMaxOffset(endContainer)
    : Math.min(savedData.endOffset, getMaxOffset(endContainer))
  );
  return newRange;
}
function preserveSelection(mainAction) {
  const rangeData = saveSelectionRangeData();
  mainAction();
  if (rangeData) {
    const range = constructRangeFromData(rangeData);
    const selection = window.getSelection();
    selection.removeAllRanges();
    if (rangeData.isBackward) {
      const startNode = range.startContainer;
      const startOffset = range.startOffset;
      const endNode = range.endContainer;
      const endOffset = range.endOffset;
      selection.setBaseAndExtent(endNode, endOffset, startNode, startOffset);
    } else {
      selection.addRange(range);
    }
  }
}