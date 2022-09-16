const getMediumURLType = () => {
  return window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw'
}

export default getMediumURLType