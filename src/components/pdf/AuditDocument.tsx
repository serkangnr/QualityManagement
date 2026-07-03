import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#333333',
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#10b981', // emerald-500
    paddingBottom: 15,
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoContainer: {
    flexDirection: 'column',
    width: '30%'
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    letterSpacing: 2
  },
  logoSubtext: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'uppercase'
  },
  headerCenter: {
    width: '40%',
    textAlign: 'center'
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  headerRight: {
    width: '30%',
    textAlign: 'right',
    fontSize: 8,
    color: '#64748b'
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    marginBottom: 8,
    color: '#0f172a'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#e2e8f0',
  },
  gridCellTitle: {
    width: '30%',
    padding: 6,
    backgroundColor: '#f8fafc',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    fontWeight: 'bold',
    fontSize: 9
  },
  gridCellValue: {
    width: '70%',
    padding: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 9
  },
  gridCellHalfTitle: {
    width: '25%',
    padding: 6,
    backgroundColor: '#f8fafc',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    fontWeight: 'bold',
    fontSize: 9
  },
  gridCellHalfValue: {
    width: '25%',
    padding: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 9
  },
  textArea: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 100,
    lineHeight: 1.5
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10
  },
  signatureBlock: {
    width: '30%',
    alignItems: 'center'
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    marginBottom: 5,
    marginTop: 30
  },
  signatureTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569'
  }
});

interface AuditDocumentProps {
  audit: any;
}

export const AuditDocument = ({ audit }: AuditDocumentProps) => {
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formNo = "FR-022";
  const publishDate = "01.01.2024";
  const recordNo = audit.id.substring(0, 8).toUpperCase();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>BLADECO</Text>
            <Text style={styles.logoSubtext}>Kalite Yönetim Sistemi</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>İÇ DENETİM PLAN VE</Text>
            <Text style={styles.headerTitle}>GÖREVLENDİRME RAPORU</Text>
          </View>
          <View style={styles.headerRight}>
            <Text>Doküman No: {formNo}</Text>
            <Text>Yayın Tarihi: {publishDate}</Text>
            <Text>Revizyon No: 00</Text>
            <Text>Kayıt No: {recordNo}</Text>
          </View>
        </View>

        {/* Bölüm 1: Genel Bilgiler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. DENETİM BİLGİLERİ</Text>
          <View style={styles.grid}>
            <Text style={styles.gridCellTitle}>Denetim Konusu</Text>
            <Text style={styles.gridCellValue}>{audit.title}</Text>
            
            <Text style={styles.gridCellHalfTitle}>Denetlenecek Departman</Text>
            <Text style={styles.gridCellHalfValue}>{audit.department}</Text>
            
            <Text style={styles.gridCellHalfTitle}>Planlanan Tarih</Text>
            <Text style={styles.gridCellHalfValue}>{formatDateTime(audit.date)}</Text>
            
            <Text style={styles.gridCellHalfTitle}>Baş Denetçi</Text>
            <Text style={styles.gridCellHalfValue}>{audit.auditor}</Text>
            
            <Text style={styles.gridCellHalfTitle}>Durum</Text>
            <Text style={styles.gridCellHalfValue}>{audit.status}</Text>
          </View>
        </View>

        {/* Bölüm 2: Kapsam */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. DENETİM KAPSAMI VE HEDEFLERİ</Text>
          <View style={styles.textArea}>
            <Text>
              {audit.department} departmanının ISO 9001 Kalite Yönetim Sistemi gereksinimlerine ve iç prosedürlere uyumluluğunun değerlendirilmesi. Denetim esnasında önceki DÖF kayıtlarının etkinlik değerlendirmesi de yapılacaktır.
            </Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureTitle}>Baş Denetçi</Text>
            <Text style={{ fontSize: 8, marginTop: 4, color: '#64748b' }}>Tarih / İmza</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureTitle}>Departman Yöneticisi</Text>
            <Text style={{ fontSize: 8, marginTop: 4, color: '#64748b' }}>Tarih / İmza</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureTitle}>Kalite Yöneticisi (Onay)</Text>
            <Text style={{ fontSize: 8, marginTop: 4, color: '#64748b' }}>Tarih / İmza</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};
