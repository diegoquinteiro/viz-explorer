export const getScaleAndOffset = (container: Element, content: HTMLElement | SVGElement): [number, number, number] => {
  const matrix = new DOMMatrix(content.style.transform)
  return [matrix.a, container.scrollLeft - matrix.e, container.scrollTop - matrix.f]
}

export const setScaleAndOffset = (container: Element, content: HTMLElement | SVGElement, scale: number, offsetX: number, offsetY: number) => {
  const scrollX = Math.round(Math.max(offsetX, 0))
  const scrollY = Math.round(Math.max(offsetY, 0))

  // setAttribute for Chrome, style.transform for Firefox and Safari
  content.setAttribute('transform', content.style.transform = `matrix(${scale},0,0,${scale},${scrollX - offsetX},${scrollY - offsetY})`)
  content.style.margin = 0 as number & string
  container.scrollLeft = scrollX
  container.scrollTop = scrollY
  if (container.scrollLeft !== scrollX) {
    content.style.marginRight = `${scrollX}px`
    container.scrollLeft = scrollX
  }
  if (container.scrollTop !== scrollY) {
    content.style.marginBottom = `${scrollY}px`
    container.scrollTop = scrollY
  }
}
