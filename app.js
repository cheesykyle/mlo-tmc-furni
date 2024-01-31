//A NodeJS App for Creating a TMC Furniture Config list from an MLO ytyp. Used for populating Shell interiors with base props.
//Author: cheesykyle
//Example: node app.js -r 1 -r 3 -p -x="0.72795407128906" -y="0.72795407128906" -z="0.72795407128906"
//Options: -r (Default: 1) Room IDs to get props from. Always starts at 1, because room 0 is the shell itself
//         -p (Default: false) Include Portal objects like Doors
//         -x -y -z (Default: "0.0") Override Directional Offsets for the props. Usually X and Y are fine, but Z tends to be off.
//
//SAMPLE FURNITURE OUTPUT
//[{"model":1536155685,"pos":{"x":5.54129028320312,"y":5.2760009765625,"z":1.78703689575195},"rot":{"x":0.0,"y":0.0,"z":1.296844124794}}]

const options = {
    number: ['r', 'x', 'y', 'z']
}

var fs = require('fs'),
    xml2js = require('xml2js'),
    joaat = require('hash-jenkins'),
    qte = require('quaternion'),
    argv = require('minimist')(process.argv.slice(2), options);

var parser = new xml2js.Parser();

var roomNumber = 1;
if (argv.r === 0 || argv.r) {
    roomNumber = argv.r;
} else {
    console.log("DEFAULTS: No room number defined, default to:", 1);
}

var offset = {x:0.0, y:0.0, z:0.0};
if (argv.x) {
    offset.x = argv.x;
}
if (argv.y) {
    offset.y = argv.y;
}
if (argv.z) {
    offset.z = argv.z;
}
if (!argv.x && !argv.y && !argv.z) {
    console.log("DEFAULTS: No offsets defined, default to", offset);
}

var furnitureObjects = [];
fs.readFile(__dirname + '/ytyp.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        for (item in result.CMapTypes.archetypes[0].Item) {
            if (result.CMapTypes.archetypes[0].Item[item]['$'] !== undefined && result.CMapTypes.archetypes[0].Item[item]['$'].type === "CMloArchetypeDef") {
                if(roomNumber instanceof Array) {
                    for (room in roomNumber) {
                        getObjects(result, item, room)
                    }
                } else if (argv.p) {
                    getObjects(result, item, roomNumber, true)
                } else {
                    getObjects(result, item, roomNumber)
                }
            }
        }
            
        console.log(JSON.stringify(furnitureObjects));
        
        fs.writeFile(__dirname + '/ytyp.json', JSON.stringify(furnitureObjects), function(err) {
            if(err) {
                return console.log(err)
            }
        })
    });
});

function getObjects(result, item, roomNumber, checkPortals) {
    var objectsToFind = [];
        objectsToFind = (result.CMapTypes.archetypes[0].Item[item].rooms[0].Item[roomNumber].attachedObjects[0]).match(/\d+/g);

    var doors = [];
    if (checkPortals) {
        for (portal in result.CMapTypes.archetypes[0].Item[item].portals[0].Item) {
            var portalObjects = result.CMapTypes.archetypes[0].Item[item].portals[0].Item[portal].attachedObjects[0]
            if (portalObjects > 0) {
                doors = doors.concat(portalObjects.match(/\d+/g))
                objectsToFind = objectsToFind.concat(portalObjects.match(/\d+/g))
            }
        }
    }
    
    doors = doors.map(Number);
    objectsToFind = objectsToFind.map(Number);

    for (object in objectsToFind){
        foundObject = result.CMapTypes.archetypes[0].Item[item].entities[0].Item[objectsToFind[object]]
        var model = joaat.oaat(foundObject.archetypeName[0]),
            position = foundObject.position[0]['$'],
            rotation = foundObject.rotation[0]['$'];
        
        var quaternion = new qte([rotation.w, rotation.x, rotation.y, rotation.z]);
        var euler = quaternion.normalize().toEuler('YXZ');

        var x = euler[1].toFixed(5)*180/Math.PI,
            y = euler[0].toFixed(5)*180/Math.PI,
            z = euler[2].toFixed(5)*180/Math.PI;
        
        if (x == 0){x = 0.000001};
        if (y == 0){y = 0.000001};
        if (z == 0){z = 0.000001};
        
        var furnitureObject = {
            "model": model,
            "pos": {
                "x": parseFloat(position.x)+offset.x,
                "y": parseFloat(position.y)+offset.y,
                "z": parseFloat(position.z)+offset.z
            },
            "rot" : {
                "x": x,
                "y": y,
                "z": z
            }
        }

        if (doors.includes(objectsToFind[object])) {
            furnitureObject.dynamicDoor = true
        }

        furnitureObjects.push(furnitureObject);
    }
}