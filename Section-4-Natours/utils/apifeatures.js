class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // make a deep-copy
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERING - pagination, sorting, limiting and fields...
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte?|lte?)\b/g,
      (match) => `$${match}`
    );

    // FILTER ON ALL THE RESULTS RETRIEVED
    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr))

    // Return the entire object so that we can chain methods on it
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      /**
       * SORTING
       * If we pass the query
       *  - sort=price
       * Mongoose will sort on set of results on the price attribute in ascending (ASC) order
       *
       * ASC ORDER
       * We pass in a positive value for the sort value
       *  - sort=price
       *
       * DESC ORDER
       * We pass in a negative value for the sort value
       * The price has a minus (-) in-front of it, telling mongoose this is to be sorted in DESC ORDER
       *  - sort=-price
       *
       *
       */
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    /**
     * + (PLUS) (DEFAULT)
     * Will include the fields listed within the projection
     *
     * - (MINUS)
     * Will exclude the stated fields from the results that will be displayed from running the query
     */

    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // fields = `${fields} -__v`;
      this.query = this.query.select(fields);
    } else {
      /**
       * The __v is used internally by Mongo, it is a not a good idea to remove it, rather hide it from the user by excluding it always from the search
       */
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // async paginate()
  paginate() {
    /**
     * Pagination comes with selectors we need to work with
     *  - page: the page the user wants to retrieve
     *  - limit: how many results are retrieved, then be displayed in the UI
     *
     * In Mongoose we use skip() and limit() methods to do so
     *
     * limit()
     * The integer value passed, will tell Mongo to return x amount of results from the query
     *
     * skip()
     * This will move the pointer to the argument offset that is passed to the function, so MongoDB will always read from position 0, but if a user requests page 3, then we want results from 21-30 (assuming that the limit is 10), thus moving the pointer to offset 21 and read up to 30.
     *
     * ERROR HANDLING
     * We do some basic error handling where we check the page (skip pointer) entered is not greater than the results that we have
     *
     * We use the method countDocuments() where we can pass a query into it to count all the results that are found in that query
     *
     * countDocuments()
     * when nothing is passed it will count all the documents in the collection, that is not what we want, but rather a resultSet that is the same that we have at the moment, thus we pass in a queryString to solve that problem
     *
     */
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const numTours = await this.query.countDocuments(JSON.parse(queryStr));
    //   if (numTours <= skip) throw new Error('This page does not exist');
    // }

    return this;
  }
}

module.exports = APIFeatures;
