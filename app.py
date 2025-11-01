from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
class Item(BaseModel):
    name:str
    price:float
    
items ={
    "name": "apple", "price": 10.5,
}
@app.get("/items")
def home():
    return items

@app.get('item/{item_id}')
def get_item(item_name:str):
    return {"name": items["name"], "price": items["price"]}