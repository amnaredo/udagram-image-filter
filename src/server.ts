import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  app.get("/filteredimage", async (req, res, next) => {
    // 1. validate the image_url_query
    const imageUrl = req.query.image_url;
    if (!imageUrl) {
      return res.status(400).send({ message: 'File url is required' });
    }
    try { const urlValid = new URL(imageUrl); }
    catch(e) { return res.status(400).send({ message: 'File url is not valid' });}

    // 2. call filterImageFromURL(image_url) to filter the image
    const filteredpath = await filterImageFromURL(imageUrl);

    // 3. send the resulting file in the response
    res.sendFile(filteredpath, function (err) {
      if (err) {
        next(err);
      } else {
        // 4. deletes any files on the server on finish of the response
        console.log('Sent:', filteredpath);
        deleteLocalFiles([filteredpath]);
      }});
    });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();