// Helper class to build query with filtering, sorting, pagination, field selection, and search
class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // Search
  search(searchFields = ['name', 'description']) {
    const search = this.queryStr.search;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const searchQuery = searchFields.map(field => ({ [field]: searchRegex }));
      this.query = this.query.find({ $or: searchQuery });
    }
    return this;
  }

  // Filter
  filter() {
    const queryObj = { ...this.queryStr };
    const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludeFields.forEach(el => delete queryObj[el]);

    // Advanced filtering with operators (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin|regex)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sort
  sort(defaultSort = '-createdAt') {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(defaultSort);
    }
    return this;
  }

  // Field limiting
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Pagination
  paginate() {
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  // Populate related documents
  populate(populateOptions) {
    if (populateOptions) {
      this.query = this.query.populate(populateOptions);
    }
    return this;
  }

  // Get pagination metadata
  async getPaginationMetadata(totalQuery) {
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || 10;
    const total = await totalQuery;
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}

export default APIFeatures;
