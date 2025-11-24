import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Button, ScrollView, TextInput, StyleSheet } from "react-native"; // J'ai ajouté TextInput
import useFetch from "../composables/useFetch";
import { styles } from "../css/listeShip";

interface ListShipsProps {
  onAdd: () => void;
}

const ListShips = ({ onAdd }: ListShipsProps) => {
  const { GET, DELETE, PATCH } = useFetch();
  
  const [ships, setShips] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedShip, setSelectedShip] = useState<any>(null);
  const [goldAmount, setGoldAmount] = useState(""); // 2. State pour l'input

  const loadShips = async () => {
    try {
      setError(null);
      const res = await GET<any[]>("/ships");
      setShips(res || []);
    } catch (e: any) {
      setError("Impossible de charger les bateaux.");
      console.log("Erreur ships :", e);
    }
  };

  useEffect(() => {
    loadShips();
  }, []);

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleLongPress = (ship: any) => {
    setSelectedShip(ship);
    setGoldAmount(""); 
    setModalVisible(true);
  };

  const handleUpdateGold = async () => {
    const amount = parseInt(goldAmount);

    try {
        await PATCH(`/ships/${selectedShip.id}/cargo/gold`, { amount: amount });
        
        setModalVisible(false);
        loadShips(); 
    } catch (e) {
        console.log("Erreur update gold", e);
        alert("Erreur lors de la mise à jour de l'or (Fonds insuffisants ?)");
    }
  };

  const handleDelete = async () => {      
    try {
      for (const id of selectedIds) {
        await DELETE(`/ships/${id}`);
      }
      setSelectedIds([]);
      loadShips();
    } catch (e) {
      console.log("Erreur delete", e);
      setError("Impossible de supprimer certains navires.");
    } 
  };

  if (error) {
    return <Text> {error} </Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Bateaux</Text>
      
      <ScrollView>
        {ships.length === 0 ? (
          <Text style={styles.empty}>Aucun bateau pour le moment.</Text>
        ) : (
          ships.map((ship, i) => {
            const isSelected = selectedIds.includes(ship.id);
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.row,
                  isSelected && { backgroundColor: "#d3eafc", borderColor: "#2196F3" }
                ]}
                onPress={() => toggleSelection(ship.id)}
                onLongPress={() => handleLongPress(ship)}
              >             
                <Text>{isSelected ? "x " : ""}</Text>
                <Text style={styles.cellName}>{ship.name}</Text>
                <Text style={styles.cell}>{ship.captain}</Text>
                <Text style={styles.cell}>{ship.goldCargo} Or</Text>
                <Text style={styles.cell}>{ship.crewSize} H.</Text>
                <Text style={styles.cell}>{ship.createdBy}</Text>
                <Text style={styles.cell}>{ship.status}</Text>
                <Text style={styles.cell}>{ship.createdAt}</Text>
                <Text style={styles.cell}>{ship.updatedAt}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={{ padding: 10 }}>
          <Button
            title={`Supprimer (${selectedIds.length})`}
            color="red"
            onPress={handleDelete}
          />
          <Button title="Ajouter ships" onPress={onAdd} />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedShip && (
              <>
                <Text style={styles.modalTitle}>{selectedShip.name}</Text>
                <Text style={[styles.infoText, { fontSize: 18, marginVertical: 10 }]}>
                    Or actuel :  {selectedShip.goldCargo}
                </Text>

                <TextInput 
                    style={localStyles.input}
                    keyboardType="numeric" 
                    value={goldAmount}
                    onChangeText={setGoldAmount}
                />

                <View style={styles.modalButtons}>
                  <Button
                    title="Valider Transaction"
                    onPress={handleUpdateGold}
                  />
                  <View style={{ height: 10 }} /> 
                  <Button
                    title="Fermer"
                    color="grey"
                    onPress={() => setModalVisible(false)}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Petit style local pour l'input si tu ne veux pas toucher au CSS global tout de suite
const localStyles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 5,
        textAlign: 'center'
    }
});

export default ListShips;