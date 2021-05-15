import { useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface IFood {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

type ICreateFoodData = Omit<IFood, 'id' | 'available'>;

function Dashboard() {
  const [foods, setFoods] = useState<IFood[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<IFood>({} as IFood);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const plates = await api.get<IFood[]>('/foods').then((response) => {
        const foodMenu = response.data.map((food) => food);
        return foodMenu;
      });
      setFoods(plates);
    }
    loadFoods();
  }, []);

  const handleAddFood = async (food: ICreateFoodData): Promise<void> => {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true
      });
      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);
  };

  const handleEditFood = (food: IFood) => {
    setEditingFood(food);
    setEditModalOpen(true);
  };

  const handleUpdateFood = async (food: ICreateFoodData): Promise<void> => {
    try {
      const response = await api.put(`/foods/${editingFood.id}`, {
        ...editingFood,
        ...food
      });

      const foodsUpdated = foods.map((mappedFood) =>
        mappedFood.id === editingFood.id ? { ...response.data } : mappedFood
      );
      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteFood = async (id: number) => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter((food) => food.id !== id);

    setFoods(foodsFiltered);
  };

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}

export default Dashboard;
