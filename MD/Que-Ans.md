# Questions and Answers

## Basic Questions

1. **What is the purpose of the `tourSchema` in `tourModel.js`?**

   - Follow-up: What does the `enum` validator in the `difficulty` field do?

2. **What does the `AppError` class do in your project?**

   - Follow-up: How is it used in the `authControllers.js` file?

3. **What is the purpose of the `aliasTopTours` middleware in `tourController.js`?**

   - Follow-up: How does it modify the request object?

4. **What does the `rateLimit` middleware in `app.js` do?**
   - Follow-up: Why is it important for security?

   1. tourschema is to create a structure to set the tours data and tourModel is about the pre post of queries, document, aggreagtio fn to make changes before or after saving or getting the data and the enum helps us to validate and give two things like options type and a error message 
2. apperror is like a mold that shapes the error and give them a property to be known is it created by code or the user and in the authContr it is used to send the error and mark them as a  operational error and handled like them 
3, alias top tours is a path url that modify the data we get from the db and modify it in order to ratings average and the price
4. the rate limit is a third party middleware that helps to protect our app from the attacks that send multiples req to get user pass or to just crash the app 

here is the answ of basics i will send the next questions after it give me marks too from 8

## Intermediate Questions

5. **How does the `protect` middleware in `authControllers.js` ensure that only authenticated users can access certain routes?**

   - Follow-up: What happens if the token is invalid or the user no longer exists?

## Ans 
Get the token using req.header.autheantaction check if undefinded send err if not then get the id by decoding the jwt token using jwt.verify and with the secret token will get that id get the user check if user not exist send err and if true than check is pass change after jwt created take jwt.iat and password change at if everything ok then give the current user to the req.user = user  

6. **Explain how the `ApiFeatures` class in `apiFeatures.js` works.**

   - Follow-up: What does the `filter` method do, and how does it handle query parameters like `gte` or `lte`?

## Ans
Api features is a class made to use the methods like filter, fields or sort and apgination with constructor of the query and queryStr 
In the filter we first excluded the methods like filter and others from req.query and after that we use a special synthax to replace the gte to $gte 
ex. str.repalce(/|b(gt)b\/g, (match) => `$${match})

7. **What is the purpose of the virtual property `durationInWeeks` in `tourModel.js`?**

   - Follow-up: How is it different from a regular schema field?

   virtual property is made just in time we are sending data to user by calculating fields like for duration weeks for a ceratian tour it duration can be changed but if we saved the durationInweeks it will be acc. to the old one not the new one so it is better to use it like that

8. **How does the `catchAsync` utility function simplify error handling in your controllers?**
   - Follow-up: What would happen if you didn't use it?

   The catchAsync is a async fn that handles the err part by sending err using next and we don't have to wrtite try and catch again and again and help to follow the dry principle 

## Advanced Questions

9. **How does the `createResetToken` method in `userModel.js` work?**

   - Follow-up: Why is the reset token hashed before being stored in the database?

   randomStr = crypto.randomBytes(32).toString('hex)

   createResetToken = crypto.createHash('sha256).update(randomStr).digest('hex)

   // I kinda forgot the code bcz it new so i watch it but i know the how is works 

   we create a 32 str length random str then hashed it and save in db and send the non hased to the user by email in the forgot password

10. **Explain the flow of the `getAllTours` route in `tourRoutes.js`.**

    - Follow-up: How does the `ApiFeatures` class interact with the `Tours` model in this route?

    path: '/api/v1/tours' -> send req -> check route if it define & if not send Err -> 
    run the routeHandler fn for that route -> for this run the getAllTours fn  -> check if there is any queries if not then 
    -> await the tours using -> check the tours if undefined send err and true send the res  
    code:  'const tours = await Tours.find();'


11. **What does the `pre('save')` middleware in `tourModel.js` do?**

    - Follow-up: Why is the `slug` field generated before saving a document?

    The pre('save') works then there is a save method calls on the schema and the slug is generated before saving bcz pre is use to do something efore saving the data to db

12. **How does the `restrictTo` middleware in `authControllers.js` work?**
    - Follow-up: What would happen if a user without the required role tried to access a restricted route?

    restrict to is fn that takes the roles that have the access to the ceratin action and it chekc the user role is this role allowed and is available in the argument role that is passed if not then err if yes then do 
    ex. like the delete user action a user can't delete the tour but only admin can

## Challenging Questions

13. **How does the aggregation middleware in `tourModel.js` modify the aggregation pipeline?**

    - Follow-up: Why is it important to exclude `secretTour` from the results?

    the aggreagtion pipleline runs before sending data of that route and it has accessto the pipleline and its method like gt match adn all of that so what we do is
    code: '$match: {
        secretTour: {$ne : true}
    }'
    so it will not pass those who have true 
    and the secret tour is important to exclude bcz they are not for every user to see only specific ones 

14. **What is the purpose of the `select: false` option in the `createdAt` field of `tourModel.js`?**

    - Follow-up: How would you include this field in a query if needed?
    why using the select false we can tell them to not show in db or repsonses 
    and for them to show we use .('+passwors') we simply use + operator in front of the name

15. **How does the `updatePassword` route in `userRoutes.js` work?**

    - Follow-up: What happens if the current password provided by the user is incorrect?

get the route -> check it -> false send err -> true run the middleware and fn for that -> in the update pass -> we first check the user by jwt and protect method after that we get user user will send it curr pass and pass and confirm pass check the curr pass by hashing it and then if true ok not send err -> and then run validators for the pass and if all true then save them and update the password update property

16. **How would you implement caching for the `getAllTours` route?**
    - Follow-up: What challenges might you face with cache invalidation?

Let me know your answers, and I can provide feedback or ask follow-up questions based on your responses!
