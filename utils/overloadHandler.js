let handledElements = []

const handlingEventListenerOverload = (event, element, func, id) => {
  if(handledElements.filter(e => e.includes(id ?? element)).length) {
    // Removing old function
    element.removeEventListener(event, handledElements.filter(e => e.includes(id ?? element))[0][1])
    
    // Adding new function
    element.addEventListener(event, func)
    handledElements.filter(e => e.includes(id ?? element))[0][1] = func
  } else {
    // Adding function
    element.addEventListener(event, func)
    handledElements.push([id ?? element, func])
  }
}