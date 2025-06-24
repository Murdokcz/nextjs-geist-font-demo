'use client'

import { useState, useEffect } from 'react'

interface Transaction {
  id: number
  date: string
  description: string
  value: number
  type: 'receita' | 'despesa'
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentFilter, setCurrentFilter] = useState<'todos' | 'receita' | 'despesa'>('todos')
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    value: '',
    type: 'receita' as 'receita' | 'despesa'
  })

  // Load transactions from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('financialTransactions')
      if (stored) {
        setTransactions(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
      setTransactions([])
    }
  }, [])

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    try {
      localStorage.setItem('financialTransactions', JSON.stringify(transactions))
    } catch (error) {
      console.error('Erro ao salvar transações:', error)
    }
  }, [transactions])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.description || !formData.value) {
      alert('Por favor, preencha todos os campos!')
      return
    }

    const value = parseFloat(formData.value.replace(',', '.'))
    if (isNaN(value) || value <= 0) {
      alert('Por favor, insira um valor válido!')
      return
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      date: formData.date,
      description: formData.description,
      value: value,
      type: formData.type
    }

    setTransactions(prev => [...prev, newTransaction])
    
    // Reset form
    setFormData({
      date: '',
      description: '',
      value: '',
      type: 'receita'
    })
  }

  // Delete transaction
  const deleteTransaction = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransactions(prev => prev.filter(t => t.id !== id))
    }
  }

  // Calculate balance
  const calculateBalance = () => {
    return transactions.reduce((acc, transaction) => {
      return transaction.type === 'receita' 
        ? acc + transaction.value 
        : acc - transaction.value
    }, 0)
  }

  // Get filtered transactions
  const getFilteredTransactions = () => {
    if (currentFilter === 'todos') {
      return transactions
    }
    return transactions.filter(t => t.type === currentFilter)
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const balance = calculateBalance()
  const filteredTransactions = getFilteredTransactions()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Controle Financeiro Pessoal
        </h1>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
                <input 
                  type="date" 
                  id="date" 
                  required 
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                <input 
                  type="text" 
                  id="description" 
                  required 
                  placeholder="Ex: Salário, Conta de luz..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                <input 
                  type="text" 
                  id="value" 
                  required 
                  placeholder="0,00"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="type" 
                      value="receita" 
                      checked={formData.type === 'receita'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'receita' | 'despesa' }))}
                      className="mr-2"
                    />
                    <span>Receita</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="type" 
                      value="despesa" 
                      checked={formData.type === 'despesa'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'receita' | 'despesa' }))}
                      className="mr-2"
                    />
                    <span>Despesa</span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              Adicionar Lançamento
            </button>
          </form>
        </div>

        {/* Filtro e Saldo */}
        <div className="flex justify-between items-center mb-6">
          <select 
            value={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value as 'todos' | 'receita' | 'despesa')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-500">Saldo Atual</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Data</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Descrição</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Valor</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Tipo</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                ) : (
                  filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(transaction => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(transaction.date)}</td>
                        <td className="py-3 px-4">{transaction.description}</td>
                        <td className={`py-3 px-4 font-medium ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(transaction.value)}
                        </td>
                        <td className="py-3 px-4 capitalize">{transaction.type}</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-sm"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
