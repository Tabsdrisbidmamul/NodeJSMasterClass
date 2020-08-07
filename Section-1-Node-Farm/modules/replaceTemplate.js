// Parse HTML template, and plug in JSON values for 'x' product and return a String containing HTML syntax, ready to be plugged in the Overview Page
module.exports = (temp, product) => {
    let output = temp
    .replace(/{ %PRODUCT_NAME% }/g, product.productName)
    .replace(/{ %IMAGE% }/g, product.image)
    .replace(/{ %PRICE% }/g, product.price)
    .replace(/{ %FROM% }/g, product.from)
    .replace(/{ %NUTRIENTS% }/g, product.nutrients)
    .replace(/{ %QUANTITY% }/g, product.quantity)
    .replace(/{ %DESCRIPTION% }/g, product.description)
    .replace(/{ %ID% }/g, product.id);

    // Boolean check if the product is organic or not, if not then add class name to change the style for the product for both on the overview and on the product page
    return !(product.organic) ? output.replace(/{ %NOT_ORGANIC% }/g, 'not-organic') : output.replace(/{ %NOT_ORGANIC% }/g, '');
};