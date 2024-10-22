import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle  } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from '@/components/ui/separator';
import { PlusCircle, ShoppingCart, ChefHat, Trash2,User, Edit2 } from 'lucide-react';
import PhoneInputWithCountryCode from './components/PhoneInput';
import LogoutDialog from './components/LogoutDialog';
import LoadingAnimation from './components/LoadingAnimation';
import EditItemDialog from './components/EditDialog';
import DeleteConfirmationDialog from './components/DeleteDialog';
const API_URL = 'https://grocery-reminder-backend.vercel.app';
function LoginSignup({ onLogin } ) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const validateForm = () => {
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }


    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) {
      return;
    }
    const endpoint = isLogin ? '/login' : '/register';
    const body = isLogin
      ? { username, password }
      : { username, password, phone_number: phoneNumber };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('username', data.username);
          onLogin(data.username);
        
        } else {
          setIsLogin(true);
          setSuccess('Account created successfully, please login!');
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    
  };

  return (
<div className="min-h-screen flex flex-col justify-center items-center">
  <Card className="w-full max-w-lg p-8">
    <CardHeader className="text-center mb-4 font-bold text-2xl">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        {isLogin ? 'Login' : 'Sign Up'}
      </span>
    </CardHeader>
    <CardContent className="grid gap-2">
    {success && (
  <React.Fragment>
    <Alert variant="destructive" className="mb-4 border border-green-500 text-green-500">
      <AlertDescription>{success}</AlertDescription>
    </Alert>
  </React.Fragment>
)}
    {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
      <form onSubmit={handleSubmit} className="grid gap-2 p-2">
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="mb-4 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-4"
          required
        />
        {!isLogin && (
          <PhoneInputWithCountryCode
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
          />

        )}
        <Button type="submit" className="w-full">
          {isLogin ? 'Login' : 'Sign Up'}
        </Button>
      </form>
      <Button onClick={() => setIsLogin(!isLogin)} className="w-full mt-2">
        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Log In'}
      </Button>
    </CardContent>
  </Card>
</div>

  );
}

export default function SmartGroceryList() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [groceryList, setGroceryList] = useState([]);
  const [username, setUsername] = useState('');
  const [newItem, setNewItem] = useState('');
  const [shelfLife, setShelfLife] = useState('');
  const [expiringItems, setExpiringItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [shoppingHistory, setShoppingHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/check_auth`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setIsLoggedIn(true);
            setUsername(data.username);
            await fetchUserData();
          } else {
            throw new Error('Authentication failed');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const fetchUserData = async () => {
    await Promise.all([
      fetchGroceryList(),
      fetchExpiringItems(),
      fetchShoppingHistory()
    ]);
  };

  const fetchGroceryList = async () => {
    try {
      const response = await fetch(`${API_URL}/get_list`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGroceryList(data);
      } else {
        throw new Error('Failed to fetch grocery list');
      }
    } catch (error) {
      console.error('Error fetching grocery list:', error);
    }
  };

  const fetchExpiringItems = async () => {
    try {
      const response = await fetch(`${API_URL}/get_expiring_soon`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExpiringItems(data);
      } else {
        throw new Error('Failed to fetch expiring items');
      }
    } catch (error) {
      console.error('Error fetching expiring items:', error);
    }
  };

  const fetchShoppingHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/get_shopping_history`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setShoppingHistory(data);
      } else {
        throw new Error('Failed to fetch shopping history');
      }
    } catch (error) {
      console.error('Error fetching shopping history:', error);
    }
  };
  const addItem = async () => {
    if (!newItem || !shelfLife) return;
    try {
      const response = await fetch(`${API_URL}/add_item`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newItem, shelf_life: parseInt(shelfLife) }),
      });
      if (response.ok) {
        setNewItem('');
        setShelfLife('');
        await fetchUserData();
      } else {
        throw new Error('Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const editItem = async (itemId, newName, newShelfLife) => {
    if (!newName || !newShelfLife) return;
    try {
      const response = await fetch(`${API_URL}/update_item/${itemId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newName, shelf_life: parseInt(newShelfLife) }),
      });
      if (response.ok) {
        await fetchUserData();
      } else {
        throw new Error('Failed to edit item');
      }
    } catch (error) {
      console.error('Error editing item:', error);
    }
  };
  const handleEditClick = (item) => {
    setItemToEdit(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await fetch(`${API_URL}/delete_item/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setGroceryList(prevList => prevList.filter(item => item.id !== itemToDelete.id));
      setExpiringItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };
  
  const handleDeleteAllConfirm = async () => {
    await fetch(`${API_URL}/delete_all_items`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    setGroceryList([]);
    setExpiringItems([]);
  };

  const fetchRecipes = async () => {
    const ingredients = groceryList.map(item => item.name).join(',');
    const response = await fetch(`${API_URL}/get_recipes?ingredients=${ingredients}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });    
    const data = await response.json();
    setRecipes(data.slice(0, 3));
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    setGroceryList([]);
    setExpiringItems([]);
    setShoppingHistory([]);
    setIsOpen(false); // Close dialog after logging out

  };
  const handleLogin = (loggedInUsername) => {
    setIsLoggedIn(true);
    setUsername(loggedInUsername);
    fetchUserData();
  };

  if (isLoading) {
    return <div><LoadingAnimation /></div>;
  }

  if (!isLoggedIn) {
    return <LoginSignup onLogin={handleLogin} />;
  }
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold text-gray-800 sm:text-4xl">Smart Grocery List</h1>
          <div className="flex items-center space-x-4">
            <div className=" items-center space-x-2 hidden sm:flex">
              <User className="w-7 h-7 " />
              <span className="text-md font-semibold sm:text-lg">Welcome, {username}!</span>
            </div>
            <LogoutDialog logout={logout} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <h2 className="text-xl font-semibold">Add New Item</h2>
              <PlusCircle className="text-primary h-6 w-6 animate-bounce" />
              </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                <Input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Item name"
                  required
                />
                <Input
                  type="number"
                  value={shelfLife}
                  onChange={(e) => setShelfLife(e.target.value)}
                  placeholder="Shelf life (days)"
                  required
                />
                <Button onClick={addItem} className="w-full">Add Item</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Grocery List</CardTitle>
          <div className="relative">
            <ShoppingCart className="text-primary h-6 w-6 animate-pulse" />
            {groceryList.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce"
              >
                {groceryList.length}
              </Badge>
            )}
          </div>        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {groceryList.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Your grocery list is empty.</p>
            ) : (
              <ul className="space-y-2">
                {groceryList.map((item) => (
                  <li key={item.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Expires: {new Date(item.expiry_date).toLocaleDateString()}
                      </Badge>
                      <Button
  variant="ghost"
  size="icon"
  onClick={() => handleEditClick(item)}
  className="text-primary hover:text-primary/90 transition-transform duration-200 hover:scale-110"
>
  <Edit2 className="w-4 h-4" />
</Button>
<Button
  variant="ghost"
  size="icon"
  onClick={() => handleDeleteClick(item)}
  className="text-destructive hover:text-destructive/90 transition-transform duration-200 hover:scale-110"
>
  <Trash2 className="w-4 h-4" />
</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
          {groceryList.length > 0 && (
  <Button 
    variant="outline" 
    className="w-full mt-4 hover:bg-red-500 hover:text-white transition-colors duration-200"
    onClick={() => setIsDeleteAllDialogOpen(true)}
  >
    Delete All
    
  </Button>
)}
        </CardContent>
      </Card>
        </div>

        <Separator className="my-8" />

        <Card className="mb-4">
        <CardHeader>Expiring Soon</CardHeader>
        <CardContent>
          {expiringItems.map((item) => (
            <Alert key={item.id} variant="destructive">
              <AlertDescription>
                {item.name} expires on {new Date(item.expiry_date).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          ))}
          <Alert className="mt-2">
            <AlertDescription>
              You will automatically receive notifications for items expiring soon.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

        <div className="text-center">
          <Button onClick={fetchRecipes} className="mb-6">
            <ChefHat className="mr-2" />
            Get Recipe Suggestions
          </Button>
        </div>

        {recipes.length > 0 && (
          <Card className="shadow-md">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-xl font-semibold">Recipe Suggestions</CardTitle>
        <ChefHat className="text-primary h-6 w-6" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <ul className="space-y-4">
            {recipes.map((recipe) => (
              <li key={recipe.id} className="flex items-start space-x-4">
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{recipe.title}</h3>
                  <div className="flex space-x-2 mt-1">
                    <Badge variant="secondary">Used: {recipe.usedIngredientCount}</Badge>
                    <Badge variant="outline">Missing: {recipe.missedIngredientCount}</Badge>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
        )}
      </div>
      <DeleteConfirmationDialog
  isOpen={isDeleteDialogOpen}
  setIsOpen={setIsDeleteDialogOpen}
  onConfirm={handleDeleteConfirm}
  title="Delete Item"
  description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
/>

<DeleteConfirmationDialog
  isOpen={isDeleteAllDialogOpen}
  setIsOpen={setIsDeleteAllDialogOpen}
  onConfirm={handleDeleteAllConfirm}
  title="Delete All Items"
  description="Are you sure you want to delete all items from your grocery list? This action cannot be undone."
  confirmText="Delete All"
/>
      <EditItemDialog
  item={itemToEdit}
  isOpen={isEditDialogOpen}
  setIsOpen={setIsEditDialogOpen}
  onEdit={editItem}
/>
    </div>
  );
}