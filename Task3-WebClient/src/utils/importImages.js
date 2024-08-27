function importAllImages(r) {
    let images = {};
    r.keys().forEach((item) => {
      images[item.replace('./', '')] = r(item);
    });
    return images;
  }
  
  const images = importAllImages(require.context('../photos', false, /\.(png|jpe?g|svg)$/));
  
  export default images;
  