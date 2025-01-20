import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import Dataset from '../models/dataset';
import { IUser } from '../models/users';
import { Document } from 'mongoose';
import { IDataset } from '../models/dataset';

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

// POST /datasets: Save multiple datasets for a user
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { datasets } = req.body;

    // Ensure datasets is an array
    const datasetsArray = Array.isArray(datasets) ? datasets : [datasets];

    const results: {
      savedDatasets: (Document<unknown, {}, IDataset> & IDataset)[];
      errors: { name: string; error: string; }[];
    } = {
      savedDatasets: [],
      errors: []
    };

    // Process each dataset
    for (const datasetData of datasetsArray) {
      try {
        // Check for existing dataset
        const existingDataset = await Dataset.findOne({
          user: user._id,
          name: datasetData.name
        });

        let savedDataset;
        if (existingDataset) {
          // Update existing dataset
          savedDataset = await Dataset.findOneAndUpdate(
            { _id: existingDataset._id },
            {
              file: datasetData.file,
              visible: datasetData.visible,
              layerId: datasetData.layerId,
              geojson: datasetData.geojson,
              selected: datasetData.selected
            },
            { new: true }
          );
        } else {
          // Create new dataset
          const newDataset = new Dataset({
            ...datasetData,
            user: user._id
          });
          savedDataset = await newDataset.save();
        }

        if (savedDataset) {
          results.savedDatasets.push(savedDataset);
        } else {
          results.errors.push({
            name: datasetData.name,
            error: 'Failed to save dataset'
          });
        }
      } catch (error) {
        results.errors.push({
          name: datasetData.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Return results
    res.status(200).json({
      message: 'Datasets processing completed',
      savedDatasets: results.savedDatasets,
      errors: results.errors,
      totalProcessed: datasetsArray.length,
      successCount: results.savedDatasets.length,
      errorCount: results.errors.length
    });
    return;

  } catch (error) {
    console.error('Error processing datasets:', error);
    res.status(500).json({
      message: 'Error processing datasets',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return
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

