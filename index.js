console.log('My First Program');
console.log('starting aws dynamo functions');

var aws= require('aws-sdk');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

aws.config.loadFromPath('./config.json');
var docClient = new aws.DynamoDB.DocumentClient();

var app = express();
var router = express.Router();
var apiRouter = express.Router();

/*Get all playlists starts here*/
var GetAllPlaylists = function(req,res){
 var params ={
        TableName : "videostore",
         ProjectionExpression: "playlistid, #name",
         ExpressionAttributeNames:{
             "#name" : "name"
         }
        
    };
    
  docClient.scan(params, function(err, data) {
                if(err){
                     res.json(err);    
                    }
                    else{  
                       
                        res.json(data);
                    }
        });
};

/*Get all playlists ends here*/

/*Get playlist items by playlistid starts here*/
var GetPlaylistItemsById = function(req,res){
var playlistId = req.params.playlistid;
var itemArr =[];
var videoArr = [];
        var params = {
                TableName: "videostore",                
                KeyConditionExpression:"playlistid =:playlist",    
                ExpressionAttributeValues:{
                    ":playlist":playlistId
                }
        }

        docClient.query(params,function(err,data){

                        if(err){
                            res.send(err);

                        }
                        else
                        {
                            _.each(data.Items,function(item){
                                   
                                    _.each(item.videos,function(video){
                                        var videoObject = new getVideoObject();
                                        videoObject.addVideoItem(video.name,video.id,video.description,video.preview_image_url_ssl); 
                                        videoArr.push(videoObject);

                                });                                
                                 itemArr.push(videoArr);
                            });
                            var resultData = '{"items":{"item":'+JSON.stringify(itemArr)+'}}';
                           //console.log(resultData);
                             res.send(resultData);
                        }

            });

};

var getVideoObject = function(){
    this.title = [];
    this.contentid=[];
    this.description=[];
    this.thumbnail =[];
    this.category = [];
    this.lang = [];
    this.status =[];
    this.new = [];
    this.days=[];
    this.startdate=[];
    this.enddate=[];

            this.addVideoItem = function(name,id,description,imageurl){

            if(name==null) 
                name ='';
            if(description==null)
                description='';
            if(imageurl==null)
                imageurl='';

            this.title.push(name);
            this.contentid.push(id);
            this.description.push(description)
            this.thumbnail.push(imageurl);
            this.category.push('');
            this.lang.push('');
            this.status.push('live');
            this.new.push('');
            this.days.push('');
            this.startdate.push('');
            this.enddate.push('');
            }
};


/*Get playlist items by playlistid ends here*/




router.route('/api/getallplaylists').get(GetAllPlaylists);
router.route('/api/getplaylistitems/:playlistid').get(GetPlaylistItemsById);

app.use(function(err,req,res,next){
    if(err.status   == 404){
        console.log('status is 404');
        res.status(404);
        res.send('The page you are looking does not exist');
    }
    else
    {
        return next;
    }


});
app.use('/',router);
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
});
