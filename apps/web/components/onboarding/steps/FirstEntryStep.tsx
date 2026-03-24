'use client'

import { useState, useRef } from 'react'
import {
  Utensils, Bus, Home, Zap, Smartphone, RefreshCw,
  HeartPulse, GraduationCap, Film, Shirt, Coffee, Wine, Plane, HelpCircle,
  ArrowRight, Plus, X, Upload, FileText, AlertCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './FirstEntryStep.module.css'

export interface Transaction {
  id: string
  amount: number
  category: string
  note: string
  date: string
}

export interface FirstEntryData {
  transactions: Transaction[]
  source: 'manual' | 'csv'
}

interface FirstEntryStepProps {
  onNext: (data: FirstEntryData) => void
}

interface Category {
  value: string
  label: string
  Icon: LucideIcon
}

const CATEGORIES: Category[] = [
  { value: 'food',          label: 'Food',          Icon: Utensils     },
  { value: 'transport',     label: 'Transport',     Icon: Bus          },
  { value: 'housing',       label: 'Housing',       Icon: Home         },
  { value: 'utilities',     label: 'Utilities',     Icon: Zap          },
  { value: 'phone',         label: 'Phone',         Icon: Smartphone   },
  { value: 'subscriptions', label: 'Subscriptions', Icon: RefreshCw    },
  { value: 'healthcare',    label: 'Healthcare',    Icon: HeartPulse   },
  { value: 'education',     label: 'Education',     Icon: GraduationCap},
  { value: 'entertainment', label: 'Entertainment', Icon: Film         },
  { value: 'clothing',      label: 'Clothing',      Icon: Shirt        },
  { value: 'coffee',        label: 'Coffee',        Icon: Coffee       },
  { value: 'bars',          label: 'Bars',          Icon: Wine         },
  { value: 'travel',        label: 'Travel',        Icon: Plane        },
  { value: 'other',         label: 'Other',         Icon: HelpCircle   },
]

function getCategoryMeta(value: string): Category {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1]
}

function formatDate(isoDate: string): string {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  if (isoDate === today)     return 'Today'
  if (isoDate === yesterday) return 'Yesterday'
  return new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function parseCsv(text: string): Transaction[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines      = normalized.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  // Detect delimiter by which produces more columns
  const delimiter = lines[0].split(';').length > lines[0].split(',').length ? ';' : ','
  const parseRow  = (line: string) => line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''))
  const headers   = parseRow(lines[0]).map(h => h.toLowerCase())

  const findCol = (...patterns: RegExp[]) =>
    headers.findIndex(h => patterns.some(p => p.test(h)))

  const dateIdx   = findCol(/päivä|date|datum|transact/i)
  const amountIdx = findCol(/määrä|amount|summa|belopp|kredit|debit/i)
  const descIdx   = findCol(/selitys|saaja|description|payee|viesti|message|maksaja/i)

  if (amountIdx === -1) return []

  const today   = new Date().toISOString().split('T')[0]
  const results: Transaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols   = parseRow(lines[i])
    const rawAmt = (cols[amountIdx] ?? '').replace(/\s/g, '').replace(/,(\d{2})$/, '.$1')
    const amount = parseFloat(rawAmt)
    if (isNaN(amount) || Math.abs(amount) < 0.01) continue

    results.push({
      id:       `csv-${i}`,
      amount:   Math.abs(amount),
      category: 'other',
      note:     descIdx !== -1 ? (cols[descIdx] ?? '').slice(0, 80) : '',
      date:     dateIdx !== -1 ? (cols[dateIdx]  ?? today) : today,
    })
  }

  return results.slice(0, 200)
}

export function FirstEntryStep({ onNext }: FirstEntryStepProps) {
  const [tab, setTab]               = useState<'manual' | 'csv'>('manual')
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Manual form state
  const [rawAmount, setRawAmount] = useState('')
  const [category, setCategory]   = useState<string | null>(null)
  const [note, setNote]           = useState('')

  const [visibleTxCount, setVisibleTxCount] = useState(5)

  // CSV state
  const [csvPreview, setCsvPreview]     = useState<Transaction[]>([])
  const [csvVisibleCount, setCsvVisibleCount] = useState(5)
  const [csvError, setCsvError]         = useState<string | null>(null)
  const [csvFileName, setCsvFileName]   = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parsedAmount      = parseFloat(rawAmount.replace(',', '.'))
  const validAmount       = !isNaN(parsedAmount) && parsedAmount > 0
  const canAddTransaction = validAmount && category !== null
  const canContinue       = transactions.length > 0

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (/^(\d{0,6}([.,]\d{0,2})?)?$/.test(value)) setRawAmount(value)
  }

  function addTransaction() {
    if (!canAddTransaction) return
    setTransactions(prev => [
      ...prev,
      {
        id:       `manual-${Date.now()}`,
        amount:   parsedAmount,
        category: category!,
        note:     note.trim(),
        date:     new Date().toISOString().split('T')[0],
      },
    ])
    setVisibleTxCount(n => n + 1)
    setRawAmount('')
    setCategory(null)
    setNote('')
  }

  function removeTransaction(id: string) {
    setTransactions(prev => prev.filter(tx => tx.id !== id))
  }

  function handleFormKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && canAddTransaction) addTransaction()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFileName(file.name)
    setCsvError(null)
    setCsvPreview([])
    setCsvVisibleCount(5)

    const reader = new FileReader()
    reader.onload = ev => {
      const text   = ev.target?.result as string
      const parsed = parseCsv(text)
      if (parsed.length === 0) {
        setCsvError("Couldn't read this file. Make sure it's a CSV export from your bank and hasn't been edited.")
      } else {
        setCsvPreview(parsed)
      }
    }
    reader.onerror = () => setCsvError('Failed to read the file.')
    reader.readAsText(file, 'utf-8')
    e.target.value = '' // allow re-selecting same file
  }

  function importCsvTransactions() {
    setTransactions(prev => [...prev, ...csvPreview])
    setVisibleTxCount(5)
    setCsvPreview([])
    setCsvFileName(null)
    setTab('manual')
  }

  function handleContinue() {
    if (!canContinue) return
    onNext({ transactions, source: tab })
  }

  function handleSkip() {
    onNext({ transactions: [], source: 'manual' })
  }

  return (
    <div className={styles.wrap}>

      {/* Mobile-only header — brand panel handles desktop */}
      <header className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>Your First Entries</h1>
        <p className={styles.stepSubtitle}>Add spending manually or import from your bank to get started.</p>
      </header>

      {/* Tab toggle */}
      <div className={styles.tabToggle} role="tablist" aria-label="Entry method">
        <button
          role="tab"
          type="button"
          aria-selected={tab === 'manual'}
          className={`${styles.tab} ${tab === 'manual' ? styles.tabActive : ''}`}
          onClick={() => setTab('manual')}
        >
          <span>Add manually</span>
          {transactions.length > 0 && (
            <span className={styles.tabBadge} aria-label={`${transactions.length} added`}>
              {transactions.length}
            </span>
          )}
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={tab === 'csv'}
          className={`${styles.tab} ${tab === 'csv' ? styles.tabActive : ''}`}
          onClick={() => setTab('csv')}
        >
          Import CSV
        </button>
      </div>

      {/* ── Manual panel ── */}
      {tab === 'manual' && (
        <div role="tabpanel" className={styles.panel}>

          {/* Form card */}
          <div className={styles.form}>

            {/* Amount + Note */}
            <div className={styles.formTopRow}>
              <div className={styles.amountField}>
                <label className={styles.fieldLabel} htmlFor="entry-amount">Amount</label>
                <div className={styles.amountWrap}>
                  <span className={styles.currencySymbol} aria-hidden="true">€</span>
                  <input
                    id="entry-amount"
                    type="text"
                    inputMode="decimal"
                    className={styles.amountInput}
                    value={rawAmount}
                    onChange={handleAmountChange}
                    onKeyDown={handleFormKeyDown}
                    placeholder="0.00"
                    autoComplete="off"
                    aria-label="Amount in euros"
                  />
                </div>
              </div>

              <div className={styles.noteField}>
                <label className={styles.fieldLabel} htmlFor="entry-note">Note</label>
                <input
                  id="entry-note"
                  type="text"
                  className={styles.noteInput}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  onKeyDown={handleFormKeyDown}
                  placeholder="e.g. Hesburger after lecture"
                  maxLength={80}
                />
              </div>
            </div>

            {/* Category */}
            <div className={styles.categorySection}>
              <span className={styles.fieldLabel} id="cat-label">Category</span>
              <div className={styles.categoryGrid} role="group" aria-labelledby="cat-label">
                {CATEGORIES.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={category === value}
                    className={`${styles.categoryChip} ${category === value ? styles.categoryChipSelected : ''}`}
                    onClick={() => setCategory(value)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span className={styles.categoryChipLabel}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add button */}
            <button
              type="button"
              className={styles.addButton}
              onClick={addTransaction}
              disabled={!canAddTransaction}
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add transaction</span>
            </button>

          </div>

          {/* Transaction list */}
          {transactions.length > 0 && (
            <div className={styles.txList} aria-label="Added transactions">
              <p className={styles.txListLabel}>
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} added
              </p>
              {transactions.slice(0, visibleTxCount).map(tx => {
                const meta = getCategoryMeta(tx.category)
                return (
                  <div key={tx.id} className={styles.txRow}>
                    <div className={styles.txIcon}>
                      <meta.Icon size={16} aria-hidden="true" />
                    </div>
                    <div className={styles.txMeta}>
                      <span className={styles.txLabel}>{tx.note || meta.label}</span>
                      <span className={styles.txDate}>{formatDate(tx.date)}</span>
                    </div>
                    <span className={styles.txAmount}>−€{tx.amount.toFixed(2)}</span>
                    <button
                      type="button"
                      className={styles.txRemove}
                      onClick={() => removeTransaction(tx.id)}
                      aria-label={`Remove ${tx.note || meta.label}`}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                )
              })}
              {visibleTxCount < transactions.length && (
                <button
                  type="button"
                  className={styles.txShowMoreButton}
                  onClick={() => setVisibleTxCount(n => Math.min(n + 10, transactions.length))}
                >
                  Show {Math.min(10, transactions.length - visibleTxCount)} more
                  <span className={styles.csvShowMoreCount}>
                    ({transactions.length - visibleTxCount} remaining)
                  </span>
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* ── CSV panel ── */}
      {tab === 'csv' && (
        <div role="tabpanel" className={styles.panel}>

          {/* Bank instructions */}
          <div className={styles.csvInstructions}>
            <p className={styles.csvInstructionsTitle}>How to export from your bank</p>
            <ul className={styles.csvInstructionsList}>
              <li><strong>OP:</strong> Online Banking → Transactions → Export → CSV</li>
              <li><strong>Nordea:</strong> NetBank → Account → Transactions → Export</li>
              <li><strong>S-Pankki:</strong> Online Service → Transactions → Download</li>
              <li><strong>Danske:</strong> eBanking → Account History → Export</li>
            </ul>
          </div>

          {/* Upload area */}
          <button
            type="button"
            className={styles.uploadArea}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Select CSV file to upload"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className={styles.fileInputHidden}
              onChange={handleFileChange}
              aria-hidden="true"
            />
            <Upload size={28} className={styles.uploadIcon} aria-hidden="true" />
            {csvFileName ? (
              <>
                <span className={styles.uploadFileName}>{csvFileName}</span>
                <span className={styles.uploadHint}>Tap to choose a different file</span>
              </>
            ) : (
              <>
                <span className={styles.uploadPrimary}>Tap to select your CSV file</span>
                <span className={styles.uploadHint}>Exported from OP, Nordea, S-Pankki, or Danske</span>
              </>
            )}
          </button>

          {/* Parse error */}
          {csvError && (
            <div className={styles.csvError} role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{csvError}</span>
            </div>
          )}

          {/* Preview */}
          {csvPreview.length > 0 && (
            <div className={styles.csvPreview}>
              <div className={styles.csvPreviewHeader}>
                <FileText size={16} aria-hidden="true" />
                <span>{csvPreview.length} transactions found</span>
              </div>
              <div className={styles.csvPreviewList}>
                {csvPreview.slice(0, csvVisibleCount).map(tx => (
                  <div key={tx.id} className={styles.csvPreviewRow}>
                    <div className={styles.txMeta}>
                      <span className={styles.txLabel}>{tx.note || 'Transaction'}</span>
                      <span className={styles.txDate}>{formatDate(tx.date)}</span>
                    </div>
                    <span className={styles.txAmount}>−€{tx.amount.toFixed(2)}</span>
                  </div>
                ))}
                {csvVisibleCount < csvPreview.length && (
                  <button
                    type="button"
                    className={styles.csvShowMoreButton}
                    onClick={() => setCsvVisibleCount(n => Math.min(n + 10, csvPreview.length))}
                  >
                    Show {Math.min(10, csvPreview.length - csvVisibleCount)} more
                    <span className={styles.csvShowMoreCount}>
                      ({csvPreview.length - csvVisibleCount} remaining)
                    </span>
                  </button>
                )}
              </div>
              <button
                type="button"
                className={styles.importButton}
                onClick={importCsvTransactions}
              >
                Import all {csvPreview.length} transactions
              </button>
            </div>
          )}

        </div>
      )}

      <div className={styles.spacer} />

      {/* CTA */}
      <div className={styles.cta}>
        <button
          type="button"
          className={styles.ctaButton}
          onClick={handleContinue}
          disabled={!canContinue}
        >
          <span>Go to my dashboard</span>
          <ArrowRight size={20} aria-hidden="true" />
        </button>
        {!canContinue && (
          <p className={styles.ctaHint}>
            {tab === 'csv'
              ? 'Import transactions or switch to manual entry'
              : 'Add at least one transaction above'}
          </p>
        )}
        <button type="button" className={styles.skipLink} onClick={handleSkip}>
          Skip for now
        </button>
      </div>

    </div>
  )
}
