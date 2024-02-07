var express = require("express")
var { graphqlHTTP } = require("express-graphql")
var { buildSchema,GraphQLObjectType } = require("graphql")
var schema = buildSchema(`
  type Query {
    hello: String,
    random:Float!,
    sum(n1:Int!,n2:Int!):Int,
    getDie(numSides: Int): RandomDie,
    ip:String
  }
  type RandomDie {
    numSides: Int!,
    rollOnce: Int!,
    roll(numRolls: Int!): [Int]
  }
`)
const loggingMiddleware = (req, res, next) => {
    console.log("ip:", req.ip)
    next()
  }
class RandomDie {
    constructor(numSides) {
      this.numSides = numSides
    }
  
    rollOnce() {
      return 1 + Math.floor(Math.random() * this.numSides)
    }
  
    roll({ numRolls }) {
      var output = []
      for (var i = 0; i < numRolls; i++) {
        output.push(this.rollOnce())
      }
      return output
    }
  }
var root = {
  hello: () => {
    return "Hello world from graphql"
  },
  random : () =>{
    return Math.random()
  },
  sum:({n1,n2}) =>{
    return n1+n2;
  },
  getDie: ({ numSides }) => {
    return new RandomDie(numSides || 6)
  }, 
  ip:function(args,request){
    return request.ip
  }
  
}

var app = express()
app.use(loggingMiddleware)
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)
app.listen(4000,()=>console.log("app listening on 4000"))