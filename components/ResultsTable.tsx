
import React from 'react';
import { PotentialLead } from '../types';
import { MapPin, Tag, Layers } from 'lucide-react';

interface ResultsTableProps {
  leads: PotentialLead[];
  onViewDetails: (lead: PotentialLead) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ leads, onViewDetails }) => {

  if (!leads || leads.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Resultados da Busca</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                {leads.length} empresas encontradas
            </span>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empresa</th>
                    <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localização</th>
                    <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalhes Técnicos</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {leads.map((lead, index) => {
                    return (
                        <tr 
                            key={index} 
                            onClick={() => onViewDetails(lead)}
                            className="group hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors cursor-pointer"
                        >
                            <td className="px-6 py-5 align-top">
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-[#FF6828] dark:group-hover:text-[#FF6828] transition-colors">{lead.nome}</div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Tag size={14} className="mr-1.5 text-gray-400 dark:text-gray-500" />
                                        {lead.segmento}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 align-top">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                    <MapPin size={16} className="mr-1.5 text-gray-400 dark:text-gray-500" />
                                    {lead.cidade}, {lead.estado}
                                </div>
                            </td>
                            <td className="px-6 py-5 align-top">
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                        <Layers size={12} className="mr-1.5 text-gray-500 dark:text-gray-400" />
                                        {lead.substrato_recomendado}
                                    </span>
                                    {lead.volume_estimado === 'Alto' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                                            Alto Volume
                                        </span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
            </table>
        </div>
    </div>
  );
};

export default ResultsTable;
