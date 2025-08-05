const express = require('express');
const fs = require('fs');
const app = express();
const port = 8080;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const file = 'characters.json';

const ensureFileExists = () => {
  if (!fs.existsSync(file)) {
    const initialData = {
      "characters": [
        {
          "id": 1,
          "name": "Spider-Man",
          "realName": "Peter Parker",
          "universe": "Marvel"
        },
        {
          "id": 2,
          "name": "Iron Man",
          "realName": "Tony Stark",
          "universe": "Marvel"
        },
        {
          "id": 3,
          "name": "Batman",
          "realName": "Bruce Wayne",
          "universe": "DC"
        }
      ]
    };
    fs.writeFileSync(file, JSON.stringify(initialData, null, 2));
  }
};

ensureFileExists();

app.get('/characters', (req, res) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    res.json(data.characters);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des données' });
  }
});

app.post('/characters', (req, res) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    
    const newId = data.characters.length > 0
      ? Math.max(...data.characters.map(c => c.id)) + 1
      : 1;
    
    const newCharacter = {
      id: newId,
      name: req.body.name,
      realName: req.body.realName,
      universe: req.body.universe
    };
    
    data.characters.push(newCharacter);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    
    res.status(201).json(newCharacter);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du personnage' });
  }
});

app.get('/characters/:id', (req, res) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    const character = data.characters.find(c => c.id == req.params.id);
    
    if (!character) {
      return res.status(404).json({ error: 'Personnage non trouvé' });
    }
    
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des données' });
  }
});

app.put('/characters/:id', (req, res) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    const id = parseInt(req.params.id);
    const characterIndex = data.characters.findIndex(c => c.id === id);
    
    if (characterIndex === -1) {
      return res.status(404).json({ error: 'Personnage non trouvé' });
    }
    
    data.characters[characterIndex] = {
      id,
      name: req.body.name,
      realName: req.body.realName,
      universe: req.body.universe
    };
    
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    
    res.json(data.characters[characterIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du personnage' });
  }
});

app.delete('/characters/:id', (req, res) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    const id = parseInt(req.params.id);
    const characterToDelete = data.characters.find(c => c.id === id);
    
    if (!characterToDelete) {
      return res.status(404).json({ error: 'Personnage non trouvé' });
    }
    
    const newCharacters = data.characters.filter(c => c.id !== id);
    fs.writeFileSync(file, JSON.stringify({ characters: newCharacters }, null, 2));
    
    res.json({ message: 'Personnage supprimé', deletedCharacter: characterToDelete });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du personnage' });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Marvel Characters fonctionnelle!', 
    endpoints: [
      'GET /characters',
      'POST /characters', 
      'GET /characters/:id',
      'PUT /characters/:id',
      'DELETE /characters/:id'
    ]
  });
});

app.listen(port, () => {
  console.log(`Serveur Marvel API démarré sur http://localhost:${port}`);
});