const express = require('express');
const fs = require('fs');
const app = express();
const port = 8080;

// Middleware pour parser JSON
app.use(express.json());

// CORS - IMPORTANT pour permettre les requêtes depuis React
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Autorise toutes les origines
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const file = 'characters.json';

// Fonction pour s'assurer que le fichier JSON existe
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
    console.log('📁 Fichier characters.json créé avec des données de base');
  }
};

// Initialiser le fichier au démarrage
ensureFileExists();

// GET - Récupérer tous les personnages
app.get('/characters', (req, res) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    console.log(`📖 GET /characters - ${data.characters.length} personnages trouvés`);
    res.json(data.characters);
  } catch (error) {
    console.error('❌ Erreur GET /characters:', error);
    res.status(500).json({ error: 'Erreur lors de la lecture des données' });
  }
});

// POST - Ajouter un nouveau personnage
app.post('/characters', (req, res) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    
    // Générer un nouvel ID
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
    
    console.log(`✅ POST /characters - Nouveau personnage créé: ${newCharacter.name}`);
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error('❌ Erreur POST /characters:', error);
    res.status(500).json({ error: 'Erreur lors de la création du personnage' });
  }
});

// GET - Récupérer un personnage par ID
app.get('/characters/:id', (req, res) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    const character = data.characters.find(c => c.id == req.params.id);
    
    if (!character) {
      console.log(`❌ GET /characters/${req.params.id} - Personnage non trouvé`);
      return res.status(404).json({ error: 'Personnage non trouvé' });
    }
    
    console.log(`📖 GET /characters/${req.params.id} - ${character.name} trouvé`);
    res.json(character);
  } catch (error) {
    console.error(`❌ Erreur GET /characters/${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la lecture des données' });
  }
});

// PUT - Mettre à jour un personnage
app.put('/characters/:id', (req, res) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    const id = parseInt(req.params.id);
    const characterIndex = data.characters.findIndex(c => c.id === id);
    
    if (characterIndex === -1) {
      console.log(`❌ PUT /characters/${id} - Personnage non trouvé`);
      return res.status(404).json({ error: 'Personnage non trouvé' });
    }
    
    // Mettre à jour le personnage
    data.characters[characterIndex] = {
      id,
      name: req.body.name,
      realName: req.body.realName,
      universe: req.body.universe
    };
    
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    
    console.log(`✅ PUT /characters/${id} - ${data.characters[characterIndex].name} mis à jour`);
    res.json(data.characters[characterIndex]);
  } catch (error) {
    console.error(`❌ Erreur PUT /characters/${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du personnage' });
  }
});

// DELETE - Supprimer un personnage
app.delete('/characters/:id', (req, res) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    const id = parseInt(req.params.id);
    const characterToDelete = data.characters.find(c => c.id === id);
    
    if (!characterToDelete) {
      console.log(`❌ DELETE /characters/${id} - Personnage non trouvé`);
      return res.status(404).json({ error: 'Personnage non trouvé' });
    }
    
    // Filtrer pour supprimer le personnage
    const newCharacters = data.characters.filter(c => c.id !== id);
    fs.writeFileSync(file, JSON.stringify({ characters: newCharacters }, null, 2));
    
    console.log(`🗑️ DELETE /characters/${id} - ${characterToDelete.name} supprimé`);
    res.json({ message: 'Personnage supprimé', deletedCharacter: characterToDelete });
  } catch (error) {
    console.error(`❌ Erreur DELETE /characters/${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la suppression du personnage' });
  }
});

// Route de test pour vérifier que le serveur fonctionne
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

// Démarrage du serveur
app.listen(port, () => {
  console.log('🚀 ═══════════════════════════════════════');
  console.log(`🚀 Serveur Marvel API démarré !`);
  console.log(`🚀 URL: http://localhost:${port}`);
  console.log(`🚀 Test: http://localhost:${port}/characters`);
  console.log('🚀 ═══════════════════════════════════════');
});