import db from '../database/index.js';

async function addRequesterDesignationColumn() {
  try {
    console.log('Adding requesterDesignation column to booking_requests table...');
    
    // Check if the column already exists
    const tableInfo = await db.raw("PRAGMA table_info(booking_requests)");
    const columnExists = tableInfo.some((column: any) => column.name === 'requesterDesignation');
    
    if (columnExists) {
      console.log('Column requesterDesignation already exists in booking_requests table.');
      return;
    }
    
    // Add the column
    await db.schema.alterTable('booking_requests', (table) => {
      table.string('requesterDesignation');
    });
    
    console.log('✅ Successfully added requesterDesignation column to booking_requests table.');
    
  } catch (error) {
    console.error('Error adding requesterDesignation column:', error);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

addRequesterDesignationColumn();
