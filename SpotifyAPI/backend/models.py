from sqlalchemy import Column, ForeignKey, Integer, String, Table,ARRAY
from database import Base

class Playlist(Base):
    __tablename__ = 'playlists'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    

class User(Base):

    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)

    email = Column(String,nullable=False,unique=True)
    password = Column(String,nullable=False)
