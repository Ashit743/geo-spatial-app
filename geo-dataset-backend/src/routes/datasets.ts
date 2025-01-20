import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import Dataset from '../models/dataset';
import { IUser } from '../models/users';

const router = express.Router();

// GET /datasets: Retrieve datasets for a logged-in user
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const datasets = await Dataset.find({ user: user._id });
    res.json(datasets);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving datasets', error: error });
  }
});

// POST /datasets: Save a dataset for a user
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const newDataset = new Dataset({
      name: req.body.name,
      file: req.body.file,
      visible: req.body.visible,
      layerId: req.body.layerId,
      geojson: req.body.geojson,
      selected: req.body.selected,
      user: user._id
    });

    const savedDataset = await newDataset.save();
    res.status(201).json(savedDataset);
  } catch (error) {
    console.error('Error saving dataset:', error);
    res.status(400).json({ message: 'Error saving dataset', error: error });
  }
});

// PUT /datasets/:id: Update dataset visibility or other properties
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const updatedDataset = await Dataset.findOneAndUpdate(
      { _id: req.params.id, user: user._id },
      req.body,
      { new: true }
    );
    if (!updatedDataset) {
      res.status(404).json({ message: 'Dataset not found' });
      return;
    }
    res.json(updatedDataset);
  } catch (error) {
    res.status(400).json({ message: 'Error updating dataset', error: error });
  }
});

// DELETE /datasets/:id: Remove a dataset
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
       res.status(401).json({ message: 'Unauthorized' });
       return;
    }
    const deletedDataset = await Dataset.findOneAndDelete({ _id: req.params.id, user: user._id });
    if (!deletedDataset) {
       res.status(404).json({ message: 'Dataset not found' });
       return;
    }
    res.json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting dataset', error: error });
  }
});

export default router;

