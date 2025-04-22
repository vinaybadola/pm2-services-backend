import pm2 from 'pm2';
import serviceMetadataModel from '../models/service-metadata-model.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
export default class DashboardController {

    getAllProcesses(req, res) {
        try {
            pm2.list(async (err, processes) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to fetch processes' });
                }

                const processDetails = processes.map(proc => ({
                    process_id : proc.pm_id,
                    name: proc.name,
                    memory: proc.monit.memory,
                    cpu: proc.monit.cpu,
                    status: proc.pm2_env?.status || 'unknown',
                    port: proc.pm2_env?.PORT || 'N/A'
                }));

                // Fetch metadata for all processes
                const metadata = await serviceMetadataModel.find({});
                const metadataMap = new Map(metadata.map(m => [m.pm2_name, m]));

                // Merge metadata with process details
                processDetails.forEach(proc => {
                    const meta = metadataMap.get(proc.name);
                    if (meta) {
                        proc.domain_name = meta.domain_name;
                        proc.public_ip = meta.public_ip;
                        proc.private_ip = meta.private_ip;
                        proc.type = meta.type;
                        proc.uuid = meta.uuid; // Add UUID to the process details
                    }
                });

                return res.json({ success: true, data: processDetails });
            });
        } catch (err) {
            return res.status(500).json({ message: 'Failed to fetch processes', error: err.message });
        }
    }

    startProcess(req, res) {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Process name is required' });
        }
        pm2.start(name, (err, proc) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to start process' });
            }
            res.json(proc);
        });
    }

    restartProcess(req, res) {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Process name is required' });
        }
        pm2.restart(name, (err, proc) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to restart process' });
            }
            res.json(proc);
        });
    }

    stopProcess(req, res) {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Process name is required' });
        }
        pm2.stop(name, (err, proc) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to stop process' });
            }
            res.json(proc);
        });
    }

    deleteProcess(req, res) {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Process name is required' });
        }
        pm2.delete(name, (err, proc) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete process' });
            }
            res.json(proc);
        });
    }

    getProcessLogs = (req, res) => {
        const { name } = req.params;
        if (!name) {
            return res.status(400).json({ error: 'Process name is required' });
        }
    
        pm2.describe(name, (err, proc) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch process logs' });
            }
    
            if (!proc || proc.length === 0) {
                return res.status(404).json({ error: 'Process not found' });
            }
    
            const logFilePath = proc[0].pm2_env.pm_log_path; // Path to the log file
            if (!logFilePath) {
                return res.status(404).json({ error: 'Log file path not found' });
            }
    
            // Read the log file
            fs.readFile(logFilePath, 'utf8', (err, data) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to read log file' });
                }
    
                // Send the log content to the frontend
                res.json({ logs: data.split('\n') }); // Split logs into an array of lines
            });
        });
    };

    getProcessMetadata = async (req, res) => {
        try {
            const { uuid } = req.params;
            if (!uuid) {
                return res.status(400).json({ error: 'uuid name is required' });
            }
            const metadata = await serviceMetadataModel.findOne({ uuid: uuid });

            if (!metadata) {
                return res.status(404).json({ success:false, error: 'Metadata not found' });
            }

            pm2.describe(metadata.pm2_name, (err, processes) => {
                if (err || !processes || processes.length === 0) {
                    return res.status(404).json({ error: 'Process not found in PM2' });
                }

                const proc = processes[0];
                const processDetails = {
                    name: proc.name,
                    memory: proc.monit.memory,
                    cpu: proc.monit.cpu,
                    status: proc.pm2_env?.status || 'unknown',
                    port: proc.pm2_env?.PORT || 'N/A',
                    domain_name: metadata.domain_name,
                    public_ip: metadata.public_ip,
                    private_ip: metadata.private_ip,
                    type: metadata.type,
                    uuid: metadata.uuid
                };

                return res.json({ success: true, data: processDetails, more: proc });
            });
        }
        catch (err) {
            return res.status(500).json({ message: 'Failed to fetch processes', error: err.message });
        }
    }

    updateProcessMetadata = async (req, res) => {
        try {
            const { name } = req.params;
            const { domain_name, public_ip, private_ip, type } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Process name is required' });
            }
            if (!domain_name && !public_ip && !private_ip && !type) {
                return res.status(400).json({ error: 'At least one field is required' });
            }
            // create a uuid for the process
            const uuid = uuidv4();
            const metadata = await serviceMetadataModel.findOneAndUpdate({ pm2_name: name }, {
                domain_name,
                public_ip,
                private_ip,
                type,
                uuid
            }, { new: true, upsert: true });

            if (!metadata) {
                return res.status(500).json({ error: 'Failed to update process metadata' });
            }

            res.json(metadata);
        }
        catch (err) {
            console.log('AN ERROR OCCURED while updating details : ', err)
            return res.status(500).json({
                message: 'Failed to fetch processes', error: err.message
            });
        }
    }

    getProcess = async (req, res) => {
        try {
            const { name } = req.params;
            if (!name) {
                return res.status(400).json({ error: 'Process name is required' });
            }
            const data = await serviceMetadataModel.findOne({ pm2_name
                : name });
            if (!data) {
                return res.status(404).json({ error: 'Metadata not found' });
            }
            return res.json({ success: true, data });   
        }
        catch (err) {
            console.log('AN ERROR OCCURED while fetching details : ', err)
            return res.status(500).json({ message: 'Failed to fetch processes', error: err.message });
        }
    }

    restartAllProcesses = async(req,res) =>{
        try {
            pm2.restart('all', (err, proc) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to restart all processes' });
                }
                return res.json(proc);
            });
        } catch (err) {
            return res.status(500).json({ message: 'Failed to restart all processes', error: err.message });
        }
    }

    stopAllProcesses = async(req,res)=>{
        try{
            pm2.stop('all', (err, proc) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to stop all processes' });
                }
                return res.json(proc);
            });

        }
        catch(error){
            console.log('AN ERROR OCCURED while stopping all processes : ', err)``
            return res.status(500).json({ message: 'Failed to stop all processes', error: err.message });
        }
    }

    deleteAllProcesses = async(req,res)=>{
        try{
            pm2.delete('all', (err, proc) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to delete all processes' });
                }
                return res.json(proc);
            });

        }
        catch(error){
            console.log('AN ERROR OCCURED while deleting all processes : ', err)
            return res.status(500).json({ message: 'Failed to delete all processes', error: err.message });
        }
    }
}