class ApiFeatures{
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }
    search(){
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex:this.queryStr.keyword,
                $options:"i",// makes it case insensitive
            }
        } : {};
       // console.log(keyword);
        this.query = this.query.find({...keyword});
        return this;
    }

    filter(){
        const queryCopy = {...this.queryStr}; // had to do by spread object bcoz objects are sent by reference

        // removing some fields
        const removeFeilds = ["keyword","page","limit"];
        removeFeilds.forEach((key)=> delete queryCopy[key]);
       //price filtering
       
       let Str = JSON.stringify(queryCopy);
       Str = Str.replace(/\b(gt|gte|lt|lte)\b/g,(key)=> `$${key}`);
       //console.log(Str);
        this.query = this.query.find(JSON.parse(Str));
        return this;
    }

    pagination(resultPerPage){
       const currentPage = Number(this.queryStr.page) || 1;
       const toSkip = resultPerPage*(currentPage - 1);
       this.query = this.query.limit(resultPerPage).skip(toSkip) ;
       return this; 
    }

};

module.exports = ApiFeatures;