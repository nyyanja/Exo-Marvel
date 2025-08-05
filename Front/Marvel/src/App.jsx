import React, { useState, useEffect } from 'react';
import { Trash2, Edit3, Plus, X, AlertTriangle, Users } from 'lucide-react';

class CharacterService {
  static API_BASE_URL = 'http://localhost:8080';

  static async getAllCharacters() {
    try {
      console.log(' Tentative de connexion à:', `${this.API_BASE_URL}/characters`);
      const response = await fetch(`${this.API_BASE_URL}/characters`);
      console.log(' Réponse reçue:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(' Données reçues:', data);
      return data;
    } catch (error) {
      console.error(' Erreur dans getAllCharacters:', error);
      throw new Error(`Erreur de connexion: ${error.message}`);
    }
  }

  static async createCharacter(characterData) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });
      if (!response.ok) throw new Error('Erreur lors de la création');
      return await response.json();
    } catch (error) {
      throw new Error('Erreur lors de la création du personnage');
    }
  }

  static async updateCharacter(id, characterData) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/characters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return await response.json();
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour');
    }
  }

  static async deleteCharacter(id) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/characters/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return await response.json();
    } catch (error) {
      throw new Error('Erreur lors de la suppression');
    }
  }
}

const validateCharacter = (character) => {
  const errors = {};

  if (!character.name || character.name.trim().length === 0) {
    errors.name = 'Le nom du personnage est requis';
  } else if (character.name.trim().length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères';
  }

  if (!character.realName || character.realName.trim().length === 0) {
    errors.realName = 'Le nom réel est requis';
  }

  if (!character.universe || character.universe.trim().length === 0) {
    errors.universe = 'L\'univers est requis';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, characterName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="text-red-600 mr-3" size={24} />
          <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer <strong>{characterName}</strong> ?
          Cette action est irréversible.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const CharacterCard = ({ character, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="h-40 bg-red-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-3xl font-bold mb-2">
            {character.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-xs opacity-90">{character.universe}</div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{character.name}</h3>
        <p className="text-gray-600 mb-1 text-sm">
          <span className="font-semibold">Nom réel:</span> {character.realName}
        </p>
        <p className="text-gray-600 mb-3 text-sm">
          <span className="font-semibold">Univers:</span> {character.universe}
        </p>

        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            onClick={() => onEdit(character)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <Edit3 size={12} />
            Modifier
          </button>
          <button
            onClick={() => onDelete(character)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <Trash2 size={12} />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

const CharacterForm = ({ character, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    realName: '',
    universe: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (character && isEditing) {
      setFormData({
        name: character.name || '',
        realName: character.realName || '',
        universe: character.universe || ''
      });
    }
  }, [character, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateCharacter(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      if (!isEditing) {
        setFormData({
          name: '',
          realName: '',
          universe: ''
        });
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Modifier le personnage' : 'Ajouter un nouveau personnage'}
        </h2>
        {isEditing && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du personnage *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Spider-Man"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom réel *
          </label>
          <input
            type="text"
            name="realName"
            value={formData.realName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.realName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Peter Parker"
          />
          {errors.realName && (
            <p className="text-red-500 text-sm mt-1">{errors.realName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Univers *
          </label>
          <select
            name="universe"
            value={formData.universe}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.universe ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner un univers</option>
            <option value="Marvel">Marvel</option>
            <option value="DC">DC</option>
            <option value="Terre">Terre</option>
            <option value="Dark Horse">Dark Horse</option>
            <option value="Autre">Autre</option>
          </select>
          {errors.universe && (
            <p className="text-red-500 text-sm mt-1">{errors.universe}</p>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                En cours...
              </>
            ) : (
              <>
                <Plus size={16} />
                {isEditing ? 'Mettre à jour' : 'Ajouter'}
              </>
            )}
          </button>
          {isEditing && (
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, character: null });

  useEffect(() => {
    loadCharacters();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await CharacterService.getAllCharacters();
      setCharacters(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des personnages');
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCharacter = async (characterData) => {
    try {
      const newCharacter = await CharacterService.createCharacter(characterData);
      setCharacters(prev => [...prev, newCharacter]);
      showToast('Personnage ajouté avec succès !');
    } catch (err) {
      showToast('Erreur lors de l\'ajout', 'error');
      throw err;
    }
  };

  const handleUpdateCharacter = async (characterData) => {
    try {
      const updatedCharacter = await CharacterService.updateCharacter(editingCharacter.id, characterData);
      setCharacters(prev => 
        prev.map(character => 
          character.id === editingCharacter.id ? updatedCharacter : character
        )
      );
      setEditingCharacter(null);
      showToast('Personnage mis à jour avec succès !');
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
      throw err;
    }
  };

  const handleDeleteClick = (character) => {
    setConfirmModal({ isOpen: true, character });
  };

  const handleConfirmDelete = async () => {
    try {
      await CharacterService.deleteCharacter(confirmModal.character.id);
      setCharacters(prev => prev.filter(character => character.id !== confirmModal.character.id));
      showToast('Personnage supprimé avec succès !');
      setConfirmModal({ isOpen: false, character: null });
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleEditCharacter = (character) => {
    setEditingCharacter(character);
  };

  const handleCancelEdit = () => {
    setEditingCharacter(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-300 text-xl">Chargement des personnages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <AlertTriangle className="mx-auto text-red-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Erreur de connexion</h2>
          <p className="text-gray-600 mb-6">
            Impossible de se connecter au serveur. <br />
            Assurez-vous que votre backend est démarré sur le port 8080.
          </p>
          <button
            onClick={loadCharacters}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, character: null })}
        onConfirm={handleConfirmDelete}
        characterName={confirmModal.character?.name}
      />

      <header className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12 shadow-xl">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-red-300 bg-clip-text text-transparent">
            MARVEL
          </h1>
          <h2 className="text-3xl font-semibold mb-2">CHARACTERS</h2>
          <p className="text-red-100 text-lg mb-4">
            Gérez votre collection de super-héros
          </p>
          <div className="inline-block bg-red-600 bg-opacity-50 px-6 py-2 rounded-full">
            <span className="text-sm font-medium">
              {characters.length} personnage{characters.length !== 1 ? 's' : ''} au total
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Section Formulaire - Gauche */}
          <div className="w-1/3">
            <CharacterForm
              character={editingCharacter}
              onSubmit={editingCharacter ? handleUpdateCharacter : handleAddCharacter}
              onCancel={handleCancelEdit}
              isEditing={!!editingCharacter}
            />
          </div>

          {/* Section Cards - Droite */}
          <div className="w-2/3">
            {characters.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-lg">
                <Users className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucun personnage trouvé</h3>
                <p className="text-gray-600 text-lg">
                  Ajoutez votre premier super-héros !
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {characters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onDelete={handleDeleteClick}
                    onEdit={handleEditCharacter}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;