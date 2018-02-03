const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const MongoClient = require('mongodb').MongoClient;

module.exports = function(passport){
    MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client){
        if(err) throw err;
    var db = client.db('ngvirtual');
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = 'secret-message';
    passport.use(new JwtStrategy(opts,(jwt_payload,done)=>{
      //  console.log(jwt_payload);
    db.collection('users').findOne({"mid":jwt_payload.data}, function(err, user){
        if(err){
            return done(err,false);
        }
        if(user){
            return done(null, user);
        }
        else{
            return done(null, false);
        }
    
    });
    }));
    });
}