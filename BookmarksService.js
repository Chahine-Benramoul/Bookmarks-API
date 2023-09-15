import { createServer } from 'http';
import Repository from './repository.js';


function allowAllAnonymousAccess(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');
}
function accessControlConfig(req, res) {
    if (req.headers['sec-fetch-mode'] == 'cors')
        allowAllAnonymousAccess(res);
}

function CORS_Preflight(req, res) {
    if (req.method === 'OPTIONS') {
        console.log('CORS preflight verifications');
        res.end();
        return true;
    }
}

function response(res, status, data = null) {
    if (data != null)
        res.writeHead(status, { 'Content-Type': 'application/json' });
    else
        res.writeHead(status);
    // request not handled
    res.end(data);
    return true;
}

async function handleBookmarksRequest(req, res) {
    let bookmarksRepository = new Repository("./bookmarks.json");
    let bookmark = null;
    if (req.url == "/api/bookmarks") {
        switch (req.method) {
            case "GET":
                return response(res, 200, JSON.stringify(bookmarksRepository.getAll()));
            case "POST":
                bookmark = await getPayload(req, res);
                if (bookmark != null) {
                    bookmark = bookmarksRepository.add(bookmark);
                    return response(res, 201, JSON.stringify(bookmark));
                } else
                    return response(res, 400);
            case "PUT":
                bookmark = await getPayload(req, res);
                if (bookmark != null)
                    if (bookmarksRepository.update(bookmark))
                        return response(res, 204);
                    else
                        return response(res, 404);
                else
                    return response(res, 400);
        }
    } else {
        if (req.url.includes("/api/bookmarks/")) {
            let id = parseInt(req.url.substring(req.url.lastIndexOf("/") + 1, req.url.length));
            switch (req.method) {
                case "GET":
                    let bookmark = bookmarksRepository.get(id);
                    if (bookmark !== null)
                        return response(res, 200, JSON.stringify(bookmark));
                    else
                        return response(res, 404);
                case "DELETE":
                    if (bookmarksRepository.remove(id))
                        return response(res, 202);
                    else
                        return response(res, 404);
            }
        }
    }
    return false;
}

const server = createServer((req,res)=>{
    // res.writeHead(200,{'Content-Type':'application/json'})
    // res.end(JSON.stringify({method:req.method,url:req.url}));
    accessControlConfig(req,res);
    if(! CORS_Preflight(req,res))
        if(! handleBookmarksRequest(req,res))
            response(res,404)
});
const PORT = process.env.PORT || 5001;
server.listen(PORT,()=>console.log(`Server running on port ${PORT}`));